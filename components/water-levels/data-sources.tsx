"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Download, Database, Shield, Clock, CheckCircle } from "lucide-react"

const dataSources = [
  {
    name: "Scottish Water",
    logo: "SW",
    description: "Scotland's water infrastructure data",
    website: "scottishwater.co.uk",
    dataTypes: ["Reservoir Levels", "Supply Data"],
    updateFrequency: "30 minutes",
    reliability: "99.5%",
    color: "bg-blue-600",
  },
]

const exportFormats = [
  { name: "CSV", description: "Comma-separated values", icon: "📊" },
  { name: "JSON", description: "JavaScript Object Notation", icon: "🔧" },
  { name: "XML", description: "Extensible Markup Language", icon: "📄" },
  { name: "PDF Report", description: "Formatted analysis report", icon: "📋" },
]

export function DataSources() {
  const handleExport = (format: string) => {
    // Simulate export functionality
    console.log(`Exporting data in ${format} format`)
  }

  return (
    <div className="space-y-8">
      {/* Data Sources */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Database className="h-6 w-6 mr-3" />
            Data Sources & Reliability
          </CardTitle>
          <p className="text-gray-300">Trusted data from official UK water and environmental agencies</p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {dataSources.map((source, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${source.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{source.logo}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{source.name}</h3>
                      <p className="text-sm text-gray-600">{source.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://${source.website}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Data Types:</div>
                    <div className="flex flex-wrap gap-2">
                      {source.dataTypes.map((type, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Updates every {source.updateFrequency}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>{source.reliability} uptime</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Data Quality Indicators */}
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Data Quality Assurance</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-green-800">Real-time Validation</div>
                    <div className="text-green-700">Automated quality checks on all incoming data</div>
                  </div>
                  <div>
                    <div className="font-medium text-green-800">Cross-verification</div>
                    <div className="text-green-700">Multiple source validation for accuracy</div>
                  </div>
                  <div>
                    <div className="font-medium text-green-800">Historical Consistency</div>
                    <div className="text-green-700">Trend analysis and anomaly detection</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Download className="h-5 w-5 mr-2 text-blue-600" />
            Export Data & Reports
          </CardTitle>
          <p className="text-gray-600">Download water level data in various formats</p>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exportFormats.map((format, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                onClick={() => handleExport(format.name)}
              >
                <div className="text-center space-y-3">
                  <div className="text-3xl">{format.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {format.name}
                    </h3>
                    <p className="text-sm text-gray-600">{format.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-blue-50 group-hover:border-blue-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Database className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">API Access Available</div>
                <div className="text-blue-800">
                  Developers can access real-time water level data through our REST API.
                  <Button variant="link" className="p-0 h-auto text-blue-600 underline ml-1">
                    View API Documentation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
