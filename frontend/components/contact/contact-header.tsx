import { Badge } from "@/components/ui/badge"
import { Phone, Mail, MessageCircle, Clock, Shield } from "lucide-react"

export function ContactHeader() {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <MessageCircle className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">24</span>
          </div>
        </div>
      </div>

      <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Contact & Support</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
        Get help, report issues, or contact water agencies across the UK. We're here to assist you 24/7.
      </p>

      {/* Contact Methods */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Phone className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Phone Support</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">24/7 emergency and general inquiries</p>
          <div className="space-y-1">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">0800 123 4567</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Free from UK landlines</div>
          </div>
        </div>

        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Mail className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Email Support</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Response within 24 hours</p>
          <div className="space-y-1">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">help@ukwatertracker.gov.uk</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">General inquiries</div>
          </div>
        </div>

        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Instant support during business hours</p>
          <div className="space-y-1">
            <Badge className="bg-green-600 text-white">Online Now</Badge>
            <div className="text-sm text-gray-500 dark:text-gray-400">Mon-Fri 8AM-6PM</div>
          </div>
        </div>
      </div>

      {/* Service Hours */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg max-w-2xl mx-auto">
        <div className="flex items-center justify-center space-x-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-800 dark:text-blue-200 font-medium">
            Emergency water issues: 24/7 support • General inquiries: Mon-Fri 8AM-6PM
          </span>
        </div>
      </div>
    </div>
  )
}
