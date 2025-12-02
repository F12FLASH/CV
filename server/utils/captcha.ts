export interface CaptchaVerifyResult {
  success: boolean;
  score?: number;
  error?: string;
}

export async function verifyCaptcha(
  captchaToken: string | undefined, 
  captchaType: string | undefined,
  secretKey?: string
): Promise<CaptchaVerifyResult> {
  if (!captchaType || captchaType === 'disabled') {
    return { success: true };
  }

  if (captchaType === 'local') {
    try {
      if (!captchaToken) return { success: true };
      const data = JSON.parse(captchaToken);
      if (data.type === 'local' && data.timeDiff && data.timeDiff >= 2000) {
        return { success: true };
      }
      return { success: false, error: 'Form submitted too quickly' };
    } catch {
      return { success: true };
    }
  }

  if (!captchaToken) {
    return { success: false, error: 'Captcha token required' };
  }

  if (captchaType === 'google') {
    const googleSecretKey = secretKey || process.env.RECAPTCHA_SECRET_KEY;
    if (!googleSecretKey) {
      console.warn('Google reCAPTCHA secret key not configured');
      return { success: true };
    }

    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${googleSecretKey}&response=${captchaToken}`
      });
      const result = await response.json() as { success: boolean; score?: number; 'error-codes'?: string[] };

      if (result.success && (result.score === undefined || result.score >= 0.5)) {
        return { success: true, score: result.score };
      }
      return { success: false, error: 'reCAPTCHA verification failed', score: result.score };
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return { success: true };
    }
  }

  if (captchaType === 'cloudflare') {
    const cfSecretKey = secretKey || process.env.TURNSTILE_SECRET_KEY;
    if (!cfSecretKey) {
      console.warn('Cloudflare Turnstile secret key not configured');
      return { success: true };
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', cfSecretKey);
      formData.append('response', captchaToken);

      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      const result = await response.json() as { success: boolean; 'error-codes'?: string[] };

      if (result.success) {
        return { success: true };
      }
      return { success: false, error: 'Turnstile verification failed' };
    } catch (error) {
      console.error('Turnstile verification error:', error);
      return { success: true };
    }
  }

  return { success: true };
}
