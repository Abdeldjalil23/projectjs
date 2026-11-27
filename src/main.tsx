import { createRoot } from 'react-dom/client'
import './i18n'
import '@fontsource/noto-sans-arabic/400.css'
import '@fontsource/noto-sans-arabic/500.css'
import '@fontsource/noto-sans-arabic/600.css'
import '@fontsource/noto-sans-arabic/700.css'
import App from './App.tsx'
import './index.css'
import { applyTheme, savedTheme } from './lib/theme'

// Colours of the last theme used on this computer, set before the first paint.
applyTheme(savedTheme())

createRoot(document.getElementById("root")!).render(<App />);
