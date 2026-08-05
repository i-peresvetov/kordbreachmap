import { Navigate, Route, Routes } from 'react-router-dom'
import { MapPage } from './pages/MapPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/customs" replace />} />
      <Route path="/:mapId/:pointId/shot" element={<MapPage />} />
      <Route path="/:mapId/:pointId" element={<MapPage />} />
      <Route path="/:mapId" element={<MapPage />} />
      <Route path="*" element={<Navigate to="/customs" replace />} />
    </Routes>
  )
}
