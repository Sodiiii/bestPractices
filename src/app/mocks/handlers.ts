import { delay, http } from 'msw'

import { DelayPresets } from './types/delays'
import { loadMocks } from './utils/mockLoader'

export const handlers = [
  http.all('*/api/*', async () => {
    await delay(DelayPresets.FAST)
  }),
  ...loadMocks(),
]
