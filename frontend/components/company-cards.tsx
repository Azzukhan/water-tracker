import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Mail, ExternalLink, MapPin } from "lucide-react"

const companies = [
  {
    name: "Scottish Water",
    logo: "SW",
    description: "Scotland's water and wastewater services",
    phone: "0800 0778 778",
    email: "help@scottishwater.co.uk",
    website: "scottishwater.co.uk",
    region: "Scotland",
    color: "bg-blue-600",
  },
  {
    name: "SEPA",
    logo: "SEPA",
    description: "Scottish Environment Protection Agency",
    phone: "01786 457 700",
    email: "enquiries@sepa.org.uk",
    website: "sepa.org.uk",
    region: "Scotland",
    color: "bg-green-600",
  },
  {
    name: "Environment Agency",
    logo: "EA",
    description: "Environmental protection for England",
    phone: "03708 506 506",
    email: "enquiries@environment-agency.gov.uk",
    website: "gov.uk/environment-agency",
    region: "England",
    color: "bg-emerald-600",
  },
  {
    name: "Natural Resources Wales",
    logo: "NRW",
    description: "Wales' environmental regulator",
    phone: "0300 065 3000",
    email: "enquiries@naturalresourceswales.gov.uk",
    website: "naturalresources.wales",
    region: "Wales",
    color: "bg-red-600",
  },
]

export function CompanyCards() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Partner Agencies</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Working with leading water and environmental agencies across the UK to provide you with accurate, real-time
            data.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {companies.map((company, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-2 dark:bg-gray-700 dark:border-gray-600"
            >
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {/* Logo */}
                  <div
                    className={`w-16 h-16 ${company.color} rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="text-white font-bold text-lg">{company.logo}</span>
                  </div>

                  {/* Company Info */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{company.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{company.description}</p>
                    <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="h-3 w-3 mr-1" />
                      {company.region}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
                      <Phone className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-mono">{company.phone}</span>
                    </div>
                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
                      <Mail className="h-4 w-4 mr-2 text-green-500" />
                      <span className="truncate">{company.email}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full group-hover:bg-blue-600 transition-colors" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get in Touch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
