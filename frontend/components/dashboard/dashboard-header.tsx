import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Bell, Settings, Download } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">My Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Personalize your water tracking experience and manage your preferences
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
            <Settings className="h-4 w-4 mr-2" />
            Update Settings
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Welcome, Guest User</h2>
              <p className="text-gray-600 dark:text-gray-300">Last login: Today at 10:45 AM</p>
            </div>
          </div>

          <div className="md:ml-auto flex flex-wrap gap-2">
            <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              Free Account
            </Badge>
            <Badge className="bg-green-600 dark:bg-green-700">
              <Bell className="h-3 w-3 mr-1" />
              Alerts Active
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
