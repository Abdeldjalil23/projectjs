import { createRoot } from 'react-dom/client'
import './i18n'
// Fonts are bundled with the app (no call to an outside font service), so the platform also works
// on the company's own servers. Montserrat is close to Gotham, the Sonatrach typeface; Tajawal is
// the Arabic face of sonatrach.com. Only the letters the three languages need are bundled.
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-500.css'
import '@fontsource/montserrat/latin-600.css'
import '@fontsource/montserrat/latin-700.css'
import '@fontsource/montserrat/latin-ext-400.css'
import '@fontsource/montserrat/latin-ext-500.css'
import '@fontsource/montserrat/latin-ext-600.css'
import '@fontsource/montserrat/latin-ext-700.css'
import '@fontsource/tajawal/arabic-400.css'
import '@fontsource/tajawal/arabic-500.css'
import '@fontsource/tajawal/arabic-700.css'
import App from './App.tsx'
import './index.css'
import { applyTheme, savedTheme } from './lib/theme'

// Colours of the last theme used on this computer, set before the first paint.
applyTheme(savedTheme())

createRoot(document.getElementById("root")!).render(<App />);
