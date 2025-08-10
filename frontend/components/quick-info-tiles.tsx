import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Plus, Lightbulb, ArrowRight, Droplets, Wrench, Leaf, BookOpen, Phone } from "lucide-react"
import Link from "next/link"

const quickActions = [
  {
    title: "Report Water Quality Issue",
    description: "Report contamination, taste, or odor issues in your area",
    icon: AlertTriangle,
    color:
      "bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700 cb:bg-cbVermillion/10 cb:border-cbVermillion/30 cb:dark:bg-cbVermillion/20 cb:dark:border-cbVermillion/40",
    iconColor: "text-red-600 cb:text-cbVermillion",
    buttonColor:
      "bg-red-600 hover:bg-red-700 cb:bg-cbVermillion cb:hover:bg-cbVermillion/90",
    href: "/contact",
  },
  {
    title: "Request New Connection",
    description: "Apply for new water supply or sewerage connections",
    icon: Plus,
    color:
      "bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700 cb:bg-cbBlue/10 cb:border-cbBlue/30 cb:dark:bg-cbBlue/20 cb:dark:border-cbBlue/40",
    iconColor: "text-blue-600 cb:text-cbBlue",
    buttonColor:
      "bg-blue-600 hover:bg-blue-700 cb:bg-cbBlue cb:hover:bg-cbBlue/90",
    href: "/contact",
  },
  {
    title: "Water Saving Tips",
    description: "Learn how to conserve water and reduce your bills",
    icon: Lightbulb,
    color:
      "bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700 cb:bg-cbBluishGreen/10 cb:border-cbBluishGreen/30 cb:dark:bg-cbBluishGreen/20 cb:dark:border-cbBluishGreen/40",
    iconColor: "text-green-600 cb:text-cbBluishGreen",
    buttonColor:
      "bg-green-600 hover:bg-green-700 cb:bg-cbBluishGreen cb:hover:bg-cbBluishGreen/90",
    href: "/blog",
  },
]

const additionalServices = [
  {
    title: "Leak Detection",
    icon: Droplets,
    description: "24/7 leak monitoring service",
  },
  {
    title: "Emergency Repairs",
    icon: Wrench,
    description: "Rapid response maintenance",
  },
  {
    title: "Sustainability",
    icon: Leaf,
    description: "Environmental impact tracking",
  },
]

export function QuickInfoTiles() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get immediate help with water-related services and information
          </p>
        </div>

        {/* Main Quick Actions */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className={action.color + " hover:shadow-lg transition-all duration-300 group cursor-pointer"}
            >
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div
                    className={
                      action.color +
                      " w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300"
                    }
                  >
                    <action.icon className={`h-8 w-8 ${action.iconColor}`} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{action.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{action.description}</p>
                  </div>

                  <Button
                    className={
                      action.buttonColor + " w-full text-white group-hover:shadow-lg transition-all duration-300"
                    }
                    asChild
                  >
                    <Link href={action.href}>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Services */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Additional Services</h3>
            <p className="text-gray-600 dark:text-gray-300">Comprehensive water management solutions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {additionalServices.map((service, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <service.icon className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{service.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{service.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Support CTAs */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <BookOpen className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Learn More</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Explore our educational blogs and guides for water conservation tips and industry insights.
                </p>
                <Button className="bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/blog">
                    Visit Blog &amp; Awareness
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <Phone className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Contact our support team for assistance with water issues, billing, or general inquiries.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/contact">
                    Contact Support
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
