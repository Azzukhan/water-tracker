import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, ExternalLink, MapPin, Clock } from "lucide-react"

const agencies = [
  {
    name: "Thames Water",
    logo: "TW",
    description: "London and Thames Valley water services",
    phone: "0800 316 9800",
    emergency: "0800 714 614",
    email: "customer.services@thameswater.co.uk",
    website: "thameswater.co.uk",
    region: "London & Thames Valley",
    color: "bg-blue-600",
    hours: "24/7 Emergency, 8AM-8PM General",
  },
  {
    name: "Scottish Water",
    logo: "SW",
    description: "Scotland's water and wastewater services",
    phone: "0800 0778 778",
    emergency: "0800 0778 778",
    email: "help@scottishwater.co.uk",
    website: "scottishwater.co.uk",
    region: "Scotland",
    color: "bg-blue-600",
    hours: "24/7 Emergency, 8AM-6PM General",
  },
  {
    name: "United Utilities",
    logo: "UU",
    description: "North West England water services",
    phone: "0345 672 3723",
    emergency: "0345 672 3723",
    email: "customer.services@uuplc.co.uk",
    website: "unitedutilities.com",
    region: "North West England",
    color: "bg-green-600",
    hours: "24/7 Emergency, 8AM-8PM General",
  },
  {
    name: "Anglian Water",
    logo: "AW",
    description: "East of England water services",
    phone: "03457 145 145",
    emergency: "03457 145 145",
    email: "customer.services@anglianwater.co.uk",
    website: "anglianwater.co.uk",
    region: "East England",
    color: "bg-cyan-600",
    hours: "24/7 Emergency, 8AM-6PM General",
  },
  {
    name: "Severn Trent",
    logo: "ST",
    description: "Midlands water and sewerage services",
    phone: "0345 750 0500",
    emergency: "0800 783 4444",
    email: "customer.relations@severntrent.co.uk",
    website: "stwater.co.uk",
    region: "Midlands",
    color: "bg-purple-600",
    hours: "24/7 Emergency, 8AM-8PM General",
  },
  {
    name: "Yorkshire Water",
    logo: "YW",
    description: "Yorkshire and Humber water services",
    phone: "0345 124 2424",
    emergency: "0345 124 2424",
    email: "customer.services@yorkshirewater.co.uk",
    website: "yorkshirewater.com",
    region: "Yorkshire",
    color: "bg-orange-600",
    hours: "24/7 Emergency, 8AM-6PM General",
  },
]

export function AgencyContacts() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <CardTitle className="text-2xl font-bold">UK Water Agency Contacts</CardTitle>
        <p className="text-gray-300">Direct contact information for regional water authorities</p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${agency.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{agency.logo}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{agency.name}</h3>
                      <p className="text-sm text-gray-600">{agency.description}</p>
                    </div>
                  </div>
                </div>

                {/* Region */}
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{agency.region}</span>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">General</span>
                    </div>
                    <a href={`tel:${agency.phone}`} className="text-sm font-mono text-blue-600 hover:underline">
                      {agency.phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Emergency</span>
                    </div>
                    <a href={`tel:${agency.emergency}`} className="text-sm font-mono text-red-600 hover:underline">
                      {agency.emergency}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <a href={`mailto:${agency.email}`} className="text-sm text-green-600 hover:underline truncate">
                      Contact
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-600">{agency.hours}</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`tel:${agency.phone}`}>
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://${agency.website}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <MapPin className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Finding Your Water Company</h3>
              <p className="text-blue-800 text-sm mb-3">
                Not sure which water company serves your area? Use your postcode to find your local water authority.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">Find My Water Company</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
