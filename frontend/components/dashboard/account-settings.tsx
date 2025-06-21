"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { User, Lock, Save, ArrowUpRight, Trash2, LogOut } from "lucide-react"

export function AccountSettings() {
  const [displayName, setDisplayName] = useState("Guest User")
  const [dataCollection, setDataCollection] = useState(true)
  const [locationSharing, setLocationSharing] = useState(true)

  const handleSaveSettings = () => {
    // Save account settings
    localStorage.setItem(
      "accountSettings",
      JSON.stringify({
        displayName,
        dataCollection,
        locationSharing,
      }),
    )

    // Show success message (in a real app)
    alert("Settings saved successfully!")
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all your data? This cannot be undone.")) {
      localStorage.clear()
      alert("All data cleared. The page will now reload.")
      window.location.reload()
    }
  }

  return (
    <Card className="shadow-lg border-0 dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-800 dark:to-black text-white">
        <CardTitle className="text-xl font-bold flex items-center">
          <User className="h-5 w-5 mr-2" />
          Account Settings
        </CardTitle>
        <p className="text-gray-300">Manage your account preferences</p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Account Type */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Account Type</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Free account with basic features</p>
            </div>
            <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
              Free
            </Badge>
          </div>
          <div className="mt-3">
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href="#" className="flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Upgrade to Premium
              </a>
            </Button>
          </div>
        </div>

        {/* Display Name */}
        <div className="mb-6">
          <Label htmlFor="display-name" className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
            Display Name
          </Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        {/* Privacy Settings */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Privacy Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-collection" className="font-medium text-gray-700 dark:text-gray-300">
                  Data Collection
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Allow anonymous usage data collection to improve services
                </p>
              </div>
              <Switch id="data-collection" checked={dataCollection} onCheckedChange={setDataCollection} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="location-sharing" className="font-medium text-gray-700 dark:text-gray-300">
                  Location Sharing
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Allow location detection for regional water data
                </p>
              </div>
              <Switch id="location-sharing" checked={locationSharing} onCheckedChange={setLocationSharing} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSaveSettings}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" asChild>
              <a href="#">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </a>
            </Button>
            <Button variant="outline" className="flex-1">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 border-red-200 dark:border-red-900/30"
            onClick={handleClearData}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
