import type { AppProps } from 'next/app'
import { AuthProvider } from '../src/contexts/AuthContext'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { LanguageProvider } from '../src/contexts/LanguageContext'
import { NotificationProvider } from '../src/contexts/NotificationContext'
import '../src/styles/theme.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
