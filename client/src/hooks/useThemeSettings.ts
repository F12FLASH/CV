import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  headingFont?: string;
  bodyFont?: string;
  borderRadius?: string;
  [key: string]: any;
}

export function useThemeSettings() {
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    refetchInterval: false,
  });

  useEffect(() => {
    if (!settings) return;

    const theme = (settings as any).theme || settings;
    if (!theme || typeof theme !== 'object') return;

    const root = document.documentElement;
    
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
      root.style.setProperty('--font-sans', `"${theme.bodyFont}", sans-serif`);
    }

    if (theme.headingFont) {
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

  }, [settings]);
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
