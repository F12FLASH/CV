
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  headingFont?: string;
  bodyFont?: string;
  borderRadius?: string;
  [key: string]: any;
}

function loadGoogleFont(fontName: string) {
  const fontId = `google-font-${fontName.replace(/\s+/g, '-')}`;
  if (document.getElementById(fontId)) return;
  
  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
}

export function useThemeSettings() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    refetchInterval: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (!settings || isLoading) return;

    let theme = (settings as any).theme;
    
    // If theme is a JSON string, parse it
    if (typeof theme === 'string') {
      try {
        theme = JSON.parse(theme);
      } catch (e) {
        console.error('Failed to parse theme from settings:', e);
        return;
      }
    }
    
    if (!theme || typeof theme !== 'object') return;

    try {
      const root = document.documentElement;
      console.log('Applying theme settings:', theme);
    
      // Apply color settings
      if (theme.primaryColor) {
        const rgb = hexToHsl(theme.primaryColor);
        root.style.setProperty('--primary', rgb);
      }
      
      if (theme.secondaryColor) {
        const rgb = hexToHsl(theme.secondaryColor);
        root.style.setProperty('--secondary', rgb);
      }
      
      if (theme.accentColor) {
        const rgb = hexToHsl(theme.accentColor);
        root.style.setProperty('--accent', rgb);
      }

      // Apply font settings
      if (theme.bodyFont) {
        loadGoogleFont(theme.bodyFont);
        root.style.setProperty('--font-sans', `"${theme.bodyFont}", sans-serif`);
      }

      if (theme.headingFont) {
        loadGoogleFont(theme.headingFont);
        root.style.setProperty('--font-heading', `"${theme.headingFont}", sans-serif`);
      }

      // Apply border radius
      if (theme.borderRadius) {
        root.style.setProperty('--radius', `${theme.borderRadius}px`);
      }

      // Apply animation speed
      if (theme.animationSpeed) {
        root.style.setProperty('--animation-speed', `${theme.animationSpeed}ms`);
      }

      // Apply line height
      if (theme.lineHeight) {
        root.style.setProperty('--line-height', theme.lineHeight);
      }

      // Apply letter spacing
      if (theme.letterSpacing) {
        root.style.setProperty('--letter-spacing', `${theme.letterSpacing}px`);
      }

      // Apply container width
      if (theme.containerWidth) {
        root.style.setProperty('--container-width', theme.containerWidth === '100%' ? '100%' : `${theme.containerWidth}px`);
      }

      // Apply shadow preset
      if (theme.shadowPreset) {
        const shadowValues = {
          none: 'none',
          soft: '0 1px 3px rgba(0,0,0,0.1)',
          medium: '0 4px 6px rgba(0,0,0,0.1)',
          bold: '0 10px 15px rgba(0,0,0,0.1)',
        };
        root.style.setProperty('--shadow', shadowValues[theme.shadowPreset as keyof typeof shadowValues] || shadowValues.soft);
      }

      // Apply custom CSS if provided
      if (theme.customCSS) {
        let styleElement = document.getElementById('custom-theme-css');
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = 'custom-theme-css';
          document.head.appendChild(styleElement);
        }
        styleElement.textContent = theme.customCSS;
      }
    } catch (error) {
      console.error('Error applying theme settings:', error);
    }
  }, [settings, isLoading]);
}
