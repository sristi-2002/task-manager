export type Palette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  danger: string;
  success: string;
  warning: string;
};

export const palettes: {light: Palette; dark: Palette} = {
  light: {
    background: '#f6f7f9',
    surface: '#ffffff',
    surfaceAlt: '#eef0f4',
    border: '#dfe3ea',
    text: '#12151a',
    textMuted: '#6b7280',
    primary: '#3b5bdb',
    onPrimary: '#ffffff',
    danger: '#d64545',
    success: '#2f9e6e',
    warning: '#c07a1e',
  },
  dark: {
    background: '#0f1115',
    surface: '#181b21',
    surfaceAlt: '#22262e',
    border: '#2d323b',
    text: '#f2f4f7',
    textMuted: '#98a2b3',
    primary: '#7f9cf5',
    onPrimary: '#10131a',
    danger: '#f08c8c',
    success: '#5fd0a0',
    warning: '#e0b062',
  },
};
