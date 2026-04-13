import './main.css'
import '@tinkerbells/xenon-ui/styles.css'
import * as z from 'zod'
import { ErrorBoundary } from 'react-error-boundary'
import { ThemeProvider } from '@tinkerbells/xenon-ui'

import { logError } from '@/shared/ui/errorHandler/logError'
import { GlobalPopoverProvider } from '@/shared/ui/globalPopover'
import { ErrorHandler } from '@/shared/ui/errorHandler/errorHandler'
import { NuqsHashAdapter } from '@/shared/lib/nuqs/nuqsHashRouterAdapter'

import { Router } from './browserRouter'

z.config(z.locales.ru())

export function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorHandler} onError={logError}>
      <ThemeProvider>
        <GlobalPopoverProvider>
          <NuqsHashAdapter>
            <Router />
          </NuqsHashAdapter>
        </GlobalPopoverProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
