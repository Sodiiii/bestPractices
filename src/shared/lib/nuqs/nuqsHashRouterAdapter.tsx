import type { FC, PropsWithChildren } from 'react'

import { useEffect, useState } from 'react'
import { unstable_createAdapterProvider as createAdapterProvider } from 'nuqs/adapters/custom'

export type { default } from 'react'

/**
 * Хук, который Nuqs будет вызывать для чтения и записи состояния в URL.
 */
function useHashAdapter() {
  function extractQueryFromHash(): URLSearchParams {
    const hash = window.location.hash.slice(1)
    const queryString = hash.includes('?') ? hash.split('?')[1] : ''
    return new URLSearchParams(queryString)
  }

  const [searchParams, setSearchParams] = useState(() => extractQueryFromHash())

  function updateUrl(updated: URLSearchParams) {
    const hash = window.location.hash.slice(1)
    const [path] = hash.split('?')
    const newHash = `${path}?${decodeURIComponent(updated.toString())}`
    window.history.pushState(null, '', `#${newHash}`)
    setSearchParams(new URLSearchParams(updated))
  }

  function getSearchParamsSnapshot() {
    return extractQueryFromHash()
  }

  useEffect(() => {
    const onHashChange = () => {
      setSearchParams(extractQueryFromHash())
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return { searchParams, updateUrl, getSearchParamsSnapshot }
}

/**
 * Компонент-провайдер адаптера, которым нужно обернуть приложение.
 */
export const NuqsHashAdapter = createAdapterProvider(useHashAdapter) as FC<PropsWithChildren>
