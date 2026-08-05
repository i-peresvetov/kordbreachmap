import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MapId } from '../../data/maps'
import type { DocumentTypeId } from '../../data/documentTypes'
import * as storage from '../../lib/pointsStorage'
import type { MapPoint } from '../../lib/pointsStorage'

export type AddPointArg = {
  mapId: MapId
  x: number
  y: number
  documentType: DocumentTypeId
  name: string
}

export const pointsApi = createApi({
  reducerPath: 'pointsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Points'],
  endpoints: (build) => ({
    getPoints: build.query<MapPoint[], MapId>({
      async queryFn(mapId) {
        try {
          return { data: storage.getPointsByMap(mapId) }
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: String(error),
            },
          }
        }
      },
      providesTags: (_result, _err, mapId) => [{ type: 'Points', id: mapId }],
    }),
    addPoint: build.mutation<MapPoint, AddPointArg>({
      async queryFn(arg) {
        try {
          return { data: storage.addPoint(arg) }
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error instanceof Error ? error.message : String(error),
            },
          }
        }
      },
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Points', id: arg.mapId },
        { type: 'Points', id: 'CUSTOM' },
      ],
    }),
    deletePoint: build.mutation<{ id: string; mapId: MapId }, { id: string; mapId: MapId }>({
      async queryFn({ id, mapId }) {
        try {
          storage.deletePoint(id)
          return { data: { id, mapId } }
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: String(error),
            },
          }
        }
      },
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Points', id: arg.mapId },
        { type: 'Points', id: 'CUSTOM' },
      ],
    }),
    getCustomCount: build.query<number, void>({
      async queryFn() {
        return { data: storage.getCustomPoints().length }
      },
      providesTags: [{ type: 'Points', id: 'CUSTOM' }],
    }),
    clearCustomPoints: build.mutation<number, void>({
      async queryFn() {
        try {
          return { data: storage.clearCustomPoints() }
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: String(error),
            },
          }
        }
      },
      invalidatesTags: ['Points'],
    }),
  }),
})

export const {
  useGetPointsQuery,
  useAddPointMutation,
  useDeletePointMutation,
  useGetCustomCountQuery,
  useClearCustomPointsMutation,
} = pointsApi
