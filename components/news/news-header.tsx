import { Badge } from "@/components/ui/badge"
import { Newspaper, TrendingUp, Clock, Globe } from "lucide-react"

export function NewsHeader() {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <Newspaper className="h-16 w-16 text-blue-600" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">24</span>
          </div>
        </div>
      </div>

      <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">UK Water News</h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
        Stay informed with the latest water industry news, updates, and developments across the United Kingdom
      </p>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">156</span>
          </div>
          <div className="text-sm text-gray-600">Stories This Month</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">24/7</span>
          </div>
          <div className="text-sm text-gray-600">Live Updates</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Globe className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">12</span>
          </div>
          <div className="text-sm text-gray-600">News Sources</div>
        </div>
      </div>

      {/* Breaking News Banner */}
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg max-w-4xl mx-auto">
        <div className="flex items-center justify-center space-x-3">
          <Badge className="bg-red-600 text-white animate-pulse">BREAKING</Badge>
          <span className="text-red-800 font-medium">
            Thames Water announces £2.5bn infrastructure investment for London water security
          </span>
        </div>
      </div>
    </div>
  )
}
