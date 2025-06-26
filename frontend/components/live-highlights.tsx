import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useNews } from "@/hooks/use-news"

function relativeTime(date: string) {
  const ms = Date.now() - new Date(date).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}


export function LiveHighlights() {
  const { news, loading } = useNews()

  const highlights = news
    .filter((n) => n.severity === "high")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 3)

  return (
    <Card className="shadow-lg border-0 h-full flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white h-24 flex flex-col justify-center rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            Live Highlights
          </CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Real-time
          </Badge>
        </div>
        <p className="text-blue-100">Latest water and weather updates across the UK</p>
      </CardHeader>

      <CardContent className="p-6 flex flex-col flex-1">
        <div className="space-y-6 flex-1">
          {loading && <p>Loading...</p>}
          {!loading &&
            highlights.map((item, idx) => (
              <div
                key={idx}
                className="border rounded-xl p-6 border-red-200 bg-red-50 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-red-600 bg-opacity-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <Badge className="bg-red-600 text-white">Critical</Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {relativeTime(item.publishedAt)}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {item.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"
                      asChild
                    >
                      <Link href={item.url} target="_blank" rel="noreferrer">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          {!loading && highlights.length === 0 && (
            <p className="text-center text-gray-600">No high alert news.</p>
          )}
        </div>

        <div className="mt-8 text-center">
          <Button className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/news">
              View All News Updates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
