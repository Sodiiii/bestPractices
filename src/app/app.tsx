import './main.css'
import '@tinkerbells/xenon-ui/styles.css'
import * as z from 'zod'
import { ErrorBoundary } from 'react-error-boundary'
import { ThemeProvider } from '@tinkerbells/xenon-ui'
import { Provider as ReduxProvider } from 'react-redux'

import { store } from '@/shared/store'
import { logError } from '@/shared/ui/errorHandler/logError'
import { ErrorHandler } from '@/shared/ui/errorHandler/errorHandler'
import { NuqsHashAdapter } from '@/shared/lib/nuqs/nuqsHashRouterAdapter'

import { Router } from './browserRouter'

z.config(z.locales.ru())

export function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorHandler} onError={logError}>
      <ReduxProvider store={store}>
        <ThemeProvider>
          <NuqsHashAdapter>
            <Router />
          </NuqsHashAdapter>
        </ThemeProvider>
      </ReduxProvider>
    </ErrorBoundary>
  )
}
