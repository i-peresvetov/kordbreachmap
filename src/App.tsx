import { Navigate, Route, Routes } from 'react-router-dom'
import { MapPage } from './pages/MapPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/customs" replace />} />
      {/* Single splat route so MapPage stays mounted across point/shot URL changes */}
      <Route path="/:mapId/*" element={<MapPage />} />
      <Route path="*" element={<Navigate to="/customs" replace />} />
    </Routes>
  )
}
