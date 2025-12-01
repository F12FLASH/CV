import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

interface CaptchaSettings {
  captchaType?: 'disabled' | 'local' | 'google' | 'cloudflare';
  captchaSettings?: {
    honeypotEnabled?: boolean;
    timeValidation?: boolean;
    ipRateLimit?: boolean;
    googleSiteKey?: string;
    googleSecretKey?: string;
    googleMinScore?: number;
    cloudflareSiteKey?: string;
    cloudflareSecretKey?: string;
    cloudflareManagedMode?: boolean;
  };
  protectionCoverage?: {
    loginForm?: boolean;
    contactForm?: boolean;
    newsletterForm?: boolean;
    commentForms?: boolean;
    registrationForm?: boolean;
  };
}

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: (error: any) => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
      }) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

type FormType = 'login' | 'contact' | 'newsletter' | 'comment' | 'registration';

interface UseRecaptchaOptions {
  formType: FormType;
  action?: string;
}

interface UseRecaptchaReturn {
  isEnabled: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  captchaType: 'disabled' | 'local' | 'google' | 'cloudflare' | null;
  executeRecaptcha: () => Promise<string | null>;
  renderTurnstile: (containerId: string) => void;
  resetTurnstile: () => void;
  getFormStartTime: () => number;
  honeypotFieldName: string;
  error: string | null;
}

export function useRecaptcha({ formType, action }: UseRecaptchaOptions): UseRecaptchaReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const formStartTime = useRef<number>(Date.now());
  const scriptLoadAttempted = useRef(false);

  const { data: settings, isLoading } = useQuery<CaptchaSettings>({
    queryKey: ['/api/security/settings'],
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const captchaType = settings?.captchaType || 'local';
  const captchaSettings = settings?.captchaSettings || {};
  const protectionCoverage = settings?.protectionCoverage || {};

  const isFormProtected = useCallback(() => {
    switch (formType) {
      case 'login':
        return protectionCoverage.loginForm !== false;
      case 'contact':
        return protectionCoverage.contactForm !== false;
      case 'newsletter':
        return protectionCoverage.newsletterForm !== false;
      case 'comment':
        return protectionCoverage.commentForms !== false;
      case 'registration':
        return protectionCoverage.registrationForm !== false;
      default:
        return true;
    }
  }, [formType, protectionCoverage]);

  const isEnabled = captchaType !== 'disabled' && isFormProtected();

  useEffect(() => {
    formStartTime.current = Date.now();
  }, []);

  useEffect(() => {
    if (scriptLoadAttempted.current) return;
    if (isLoading || !settings) return;
    if (captchaType === 'disabled' || captchaType === 'local') {
      setIsLoaded(true);
      return;
    }

    scriptLoadAttempted.current = true;

    const loadScript = (src: string, id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${id}`));
        document.head.appendChild(script);
      });
    };

    const loadCaptchaScript = async () => {
      try {
        if (captchaType === 'google' && captchaSettings.googleSiteKey) {
          await loadScript(
            `https://www.google.com/recaptcha/api.js?render=${captchaSettings.googleSiteKey}`,
            'google-recaptcha-script'
          );
          if (window.grecaptcha) {
            window.grecaptcha.ready(() => {
              setIsLoaded(true);
            });
          }
        } else if (captchaType === 'cloudflare' && captchaSettings.cloudflareSiteKey) {
          await loadScript(
            'https://challenges.cloudflare.com/turnstile/v0/api.js',
            'cloudflare-turnstile-script'
          );
          const checkTurnstile = setInterval(() => {
            if (window.turnstile) {
              clearInterval(checkTurnstile);
              setIsLoaded(true);
            }
          }, 100);
          setTimeout(() => clearInterval(checkTurnstile), 5000);
        } else {
          setIsLoaded(true);
        }
      } catch (err: any) {
        setError(err.message);
        setIsLoaded(true);
      }
    };

    loadCaptchaScript();
  }, [captchaType, captchaSettings, isLoading, settings]);

  const executeRecaptcha = useCallback(async (): Promise<string | null> => {
    if (captchaType === 'disabled') {
      return null;
    }

    if (captchaType === 'local') {
      const timeDiff = Date.now() - formStartTime.current;
      if (captchaSettings.timeValidation && timeDiff < 3000) {
        setError('Form submitted too quickly. Please wait a moment.');
        return null;
      }
      return JSON.stringify({
        type: 'local',
        timestamp: Date.now(),
        formStartTime: formStartTime.current,
        timeDiff
      });
    }

    if (captchaType === 'google') {
      if (!window.grecaptcha || !captchaSettings.googleSiteKey) {
        console.warn('Google reCAPTCHA not available');
        return null;
      }
      try {
        const token = await window.grecaptcha.execute(captchaSettings.googleSiteKey, {
          action: action || formType
        });
        return token;
      } catch (err: any) {
        setError('reCAPTCHA verification failed');
        return null;
      }
    }

    if (captchaType === 'cloudflare') {
      if (turnstileToken) {
        return turnstileToken;
      }
      setError('Please complete the Turnstile challenge');
      return null;
    }

    return null;
  }, [captchaType, captchaSettings, action, formType, turnstileToken]);

  const renderTurnstile = useCallback((containerId: string) => {
    if (captchaType !== 'cloudflare' || !window.turnstile || !captchaSettings.cloudflareSiteKey) {
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    if (turnstileWidgetId.current) {
      window.turnstile.remove(turnstileWidgetId.current);
    }

    turnstileWidgetId.current = window.turnstile.render(container, {
      sitekey: captchaSettings.cloudflareSiteKey,
      callback: (token: string) => {
        setTurnstileToken(token);
        setError(null);
      },
      'error-callback': (err: any) => {
        setError('Turnstile verification failed');
        setTurnstileToken(null);
      },
      theme: 'auto',
      size: 'normal'
    });
  }, [captchaType, captchaSettings.cloudflareSiteKey]);

  const resetTurnstile = useCallback(() => {
    if (turnstileWidgetId.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current);
      setTurnstileToken(null);
    }
  }, []);

  const getFormStartTime = useCallback(() => {
    return formStartTime.current;
  }, []);

  const honeypotFieldName = 'website_url';

  // This useEffect is for the Turnstile component.
  // It handles rendering the Turnstile widget when captchaType is 'cloudflare'
  // and ensures cleanup when the component unmounts or captchaType changes.
  useEffect(() => {
    // Assuming captchaLoaded is a state or derived value indicating if the captcha script is loaded.
    // For this example, let's assume it's true if window.turnstile is available.
    const captchaLoaded = !!window.turnstile;

    if (captchaType === 'cloudflare' && captchaLoaded && turnstileWidgetId.current === null) {
      // We need a container ID to render the widget. Assuming 'turnstile-container'
      // is the ID of the element in your JSX where Turnstile should be rendered.
      renderTurnstile('turnstile-container');
    }

    // Cleanup function
    return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
        setTurnstileToken(null); // Clear the token as well
      }
    };
  }, [captchaType, renderTurnstile]);


  return {
    isEnabled,
    isLoaded,
    isLoading,
    captchaType: captchaType as 'disabled' | 'local' | 'google' | 'cloudflare' | null,
    executeRecaptcha,
    renderTurnstile,
    resetTurnstile,
    getFormStartTime,
    honeypotFieldName,
    error
  };
}