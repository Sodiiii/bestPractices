import storage from 'redux-persist/lib/storage'
import { combineSlices, configureStore } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'

import { apiClient } from './api/apiClient'

// eslint-disable-next-line ts/no-empty-object-type
export type LazyLoadedSlices = {}

export const rootReducer = combineSlices().withLazyLoadedSlices<LazyLoadedSlices>()

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: {
    ...persistedReducer,
    [apiClient.reducerPath]: apiClient.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiClient.middleware),
})

export const persistor = persistStore(store)
