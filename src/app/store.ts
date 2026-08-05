import { configureStore } from '@reduxjs/toolkit'
import { pointsApi } from '../features/points/pointsApi'

export const store = configureStore({
  reducer: {
    [pointsApi.reducerPath]: pointsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(pointsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
