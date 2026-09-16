import Topbar from './Topbar'
import Sidebar from './Sidebar'
import BottomTabs from './BottomTabs'

export default function Shell({ children }) {
  return (
    <div className="min-h-screen bg-page text-text-primary">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 pb-20 md:pb-4">{children}</main>
      </div>
      <BottomTabs />
    </div>
  )
}
