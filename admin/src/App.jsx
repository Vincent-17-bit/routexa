import { usePath } from './lib/router'
import Shell from './components/layout/Shell'
import Overview from './pages/Overview'
import Devices from './pages/Devices'
import LoginLogs from './pages/LoginLogs'
import SearchAnalytics from './pages/SearchAnalytics'
import RoutingAnalytics from './pages/RoutingAnalytics'
import SystemHealth from './pages/SystemHealth'
import Settings from './pages/Settings'

const ROUTES = {
  '/': Overview,
  '/devices': Devices,
  '/login-logs': LoginLogs,
  '/search-analytics': SearchAnalytics,
  '/routing-analytics': RoutingAnalytics,
  '/system-health': SystemHealth,
  '/settings': Settings
}

export default function App() {
  const path = usePath()
  const Page = ROUTES[path] || Overview

  return (
    <Shell>
      <Page />
    </Shell>
  )
}
