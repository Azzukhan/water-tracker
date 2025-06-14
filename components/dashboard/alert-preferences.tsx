"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Bell, AlertTriangle, CloudRain, Droplets, Mail, Phone, BellOff } from "lucide-react"

type AlertType = {
  id: string
  name: string
  description: string
  icon: React.ElementType
  enabled: boolean
  threshold?: number
  color: string
}

export function AlertPreferences() {
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [email, setEmail] = useState("user@example.com")
  const [phone, setPhone] = useState("")
  const [alertTypes, setAlertTypes] = useState<AlertType[]>([
    {
      id: "drought",
      name: "Drought Alerts",
      description: "Receive alerts when water levels drop below threshold",
      icon: Droplets,
      enabled: true,
      threshold: 60,
      color: "bg-orange-600 dark:bg-orange-700",
    },
    {
      id: "flood",
      name: "Flood Warnings",
      description: "Get notified about potential flooding in your area",
      icon: CloudRain,
      enabled: true,
      threshold: 90,
      color: "bg-blue-600 dark:bg-blue-700",
    },
    {
      id: "quality",
      name: "Water Quality Issues",
      description: "Alerts about contamination or quality concerns",
      icon: AlertTriangle,
      enabled: true,
      color: "bg-red-600 dark:bg-red-700",
    },
    {
      id: "maintenance",
      name: "Planned Maintenance",
      description: "Notifications about scheduled water works",
      icon: Bell,
      enabled: false,
      color: "bg-purple-600 dark:bg-purple-700",
    },
  ])

  // Load alert preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem("alertPreferences")
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences)
      setAlertsEnabled(preferences.alertsEnabled)
      setEmailNotifications(preferences.emailNotifications)
      setPushNotifications(preferences.pushNotifications)
      setSmsNotifications(preferences.smsNotifications)
      setEmail(preferences.email || "user@example.com")
      setPhone(preferences.phone || "")
      if (preferences.alertTypes) {
        setAlertTypes(preferences.alertTypes)
      }
    }
  }, [])

  // Save alert preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem(
      "alertPreferences",
      JSON.stringify({
        alertsEnabled,
        emailNotifications,
        pushNotifications,
        smsNotifications,
        email,
        phone,
        alertTypes,
      }),
    )
  }, [alertsEnabled, emailNotifications, pushNotifications, smsNotifications, email, phone, alertTypes])

  const toggleAlertType = (id: string) => {
    setAlertTypes(alertTypes.map((alert) => (alert.id === id ? { ...alert, enabled: !alert.enabled } : alert)))
  }

  const updateThreshold = (id: string, value: number[]) => {
    setAlertTypes(alertTypes.map((alert) => (alert.id === id ? { ...alert, threshold: value[0] } : alert)))
  }

  return (
    <Card className="shadow-lg border-0 dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-800 dark:to-red-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Alert Preferences
            </CardTitle>
            <p className="text-orange-100">Customize notifications for water-related events</p>
          </div>
          <Switch
            checked={alertsEnabled}
            onCheckedChange={setAlertsEnabled}
            className="data-[state=checked]:bg-white data-[state=checked]:text-orange-600"
          />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!alertsEnabled ? (
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <BellOff className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Alerts are disabled</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You won't receive any notifications about water events in your area
            </p>
            <Button onClick={() => setAlertsEnabled(true)}>Enable Alerts</Button>
          </div>
        ) : (
          <>
            {/* Notification Methods */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Notification Methods</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <Label htmlFor="email-notifications" className="font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive alerts via email</p>
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                {emailNotifications && (
                  <div className="pl-12">
                    <Label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <Label htmlFor="push-notifications" className="font-medium text-gray-900 dark:text-white">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive alerts on your browser or mobile app
                      </p>
                    </div>
                  </div>
                  <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <Label htmlFor="sms-notifications" className="font-medium text-gray-900 dark:text-white">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive alerts via text message</p>
                    </div>
                  </div>
                  <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                </div>

                {smsNotifications && (
                  <div className="pl-12">
                    <Label htmlFor="phone" className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07123 456789"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Alert Types */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Alert Types</h3>
                <Badge className="bg-blue-600 dark:bg-blue-700">
                  {alertTypes.filter((alert) => alert.enabled).length} Active
                </Badge>
              </div>

              <div className="space-y-4">
                {alertTypes.map((alert) => {
                  const AlertIcon = alert.icon
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        alert.enabled
                          ? "border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${alert.color} text-white`}>
                            <AlertIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{alert.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{alert.description}</p>
                          </div>
                        </div>
                        <Switch checked={alert.enabled} onCheckedChange={() => toggleAlertType(alert.id)} />
                      </div>

                      {alert.enabled && alert.threshold !== undefined && (
                        <div className="pl-10">
                          <div className="mb-1 flex items-center justify-between">
                            <Label className="text-sm text-gray-700 dark:text-gray-300">
                              Alert Threshold: {alert.threshold}%
                            </Label>
                            <Badge
                              variant="outline"
                              className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                            >
                              {alert.id === "drought"
                                ? `Below ${alert.threshold}%`
                                : alert.id === "flood"
                                  ? `Above ${alert.threshold}%`
                                  : `${alert.threshold}%`}
                            </Badge>
                          </div>
                          <Slider
                            defaultValue={[alert.threshold]}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={(value) => updateThreshold(alert.id, value)}
                            className="py-2"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-500 mb-1">Important Note</h4>
                    <p className="text-yellow-700 dark:text-yellow-600">
                      Emergency alerts from government agencies may still be sent regardless of these settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
