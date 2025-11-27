import type { AppProps } from 'next/app'
import { DefaultSeo } from 'next-seo'
import GlobalStyle from '../styles/GlobalStyle'
import SEO from '../next-seo.config'
import { AuthProvider } from '../contexts/AuthContext'
import { NotificationProvider } from '../contexts/NotificationContext'
import ErrorBoundary from '../components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo {...SEO} />
      <GlobalStyle />
      <ErrorBoundary>
        <NotificationProvider>
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </>
  )
}