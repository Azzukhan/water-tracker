import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Phone, Zap, Droplets, CloudRainIcon as Flood } from "lucide-react"

const emergencyContacts = [
  {
    type: "Water Emergency",
    number: "999",
    description: "Burst mains, flooding, contamination",
    icon: Droplets,
    color: "bg-red-600 cb:bg-cbVermillion",
    available: "24/7",
  },
  {
    type: "Power Emergency",
    number: "105",
    description: "Power cuts affecting water pumps",
    icon: Zap,
    color: "bg-orange-600 cb:bg-cbOrange",
    available: "24/7",
  },
  {
    type: "Flood Emergency",
    number: "0345 988 1188",
    description: "Environment Agency Floodline",
    icon: Flood,
    color: "bg-blue-600 cb:bg-cbBlue",
    available: "24/7",
  },
]

export function EmergencyContacts() {
  return (
    <Card className="shadow-lg border-0 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 cb:bg-cbVermillion/10 cb:dark:bg-cbVermillion/20 cb:border-cbVermillion/30 cb:dark:border-cbVermillion/40">
      <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 cb:from-cbVermillion cb:to-cbOrange text-white">
        <CardTitle className="text-2xl font-bold flex items-center">
          <AlertTriangle className="h-6 w-6 mr-3 animate-pulse" />
          Emergency Contacts
        </CardTitle>
        <p className="text-red-100 dark:text-red-200 cb:text-cbVermillion">For immediate assistance with water emergencies</p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {emergencyContacts.map((contact, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-colors"
            >
              <div className="text-center space-y-4">
                <div className={`w-16 h-16 ${contact.color} rounded-full flex items-center justify-center mx-auto`}>
                  <contact.icon className="h-8 w-8 text-white" />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{contact.type}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{contact.description}</p>
                  <Badge className="bg-green-600 cb:bg-cbBluishGreen text-white mb-3">{contact.available}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{contact.number}</div>
                  <Button
                    className={`w-full ${contact.color} hover:opacity-90 text-white`}
                    asChild
                  >
                    <a href={`tel:${contact.number}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 cb:bg-cbYellow/10 cb:dark:bg-cbYellow/20 cb:border-cbYellow/30 cb:dark:border-cbYellow/40 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 cb:text-cbYellow mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 cb:text-cbYellow mb-1">When to Call Emergency Services</h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 cb:text-cbYellow space-y-1">
                <li>• Burst water mains causing flooding</li>
                <li>• Suspected water contamination affecting health</li>
                <li>• Complete loss of water supply to large areas</li>
                <li>• Sewage overflow into homes or public areas</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
