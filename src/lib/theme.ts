// Colour theme of the interface. The colours themselves are in src/index.css; this file lists the
// themes, applies one to the page and remembers each user's choice on this computer.

export const THEMES = ['sonatrach', 'ubuntu', 'blue', 'teal', 'green', 'purple'] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = 'sonatrach';

/** Colour of each theme, shown in the picker. Keep in line with src/index.css. */
export const THEME_COLORS: Record<Theme, string> = {
  sonatrach: '#FF8500',
  ubuntu: '#E95420',
  blue: '#1976D2',
  teal: '#0D9488',
  green: '#1B9E4B',
  purple: '#7D4ACF',
};

const KEY = 'medsuite.theme';

const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme);

const read = (key: string): Theme | null => {
  try {
    const value = localStorage.getItem(key);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
};

const write = (key: string, theme: Theme) => {
  try {
    localStorage.setItem(key, theme);
  } catch {
    // Storage can be unavailable (private mode, blocked site data): the theme stays for this visit only.
  }
};

/** Shows the page in a theme. */
export const applyTheme = (theme: Theme) => {
  if (theme === DEFAULT_THEME) delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
};

/**
 * Theme of a user on this computer. Each staff identifier keeps its own choice, so colleagues
 * sharing a computer each find their colours. Before sign-in, the last theme used is shown.
 */
export const savedTheme = (staffId?: string | null): Theme =>
  (staffId ? read(`${KEY}.${staffId.toLowerCase()}`) : null) ?? read(KEY) ?? DEFAULT_THEME;

export const saveTheme = (theme: Theme, staffId?: string | null) => {
  if (staffId) write(`${KEY}.${staffId.toLowerCase()}`, theme);
  write(KEY, theme);
  applyTheme(theme);
};
