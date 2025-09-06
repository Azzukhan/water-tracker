import { BookOpen, Users, TrendingUp, Award } from "lucide-react"
import html2canvas from "html2canvas"

export function BlogsHeader() {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <BookOpen className="h-16 w-16 text-green-600 dark:text-green-400 cb:text-cbBluishGreen" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 cb:bg-cbBlue rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        </div>
      </div>

      <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Water Awareness & Education</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
        Discover insights, tips, and knowledge about water conservation, sustainability, and the UK water industry
      </p>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400 cb:text-cbBluishGreen mr-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">27</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Educational Articles</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 cb:text-cbBlue mr-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">12K</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Readers</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 cb:text-cbPurple mr-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">89%</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Award className="h-5 w-5 text-orange-600 dark:text-orange-400 cb:text-cbOrange mr-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">5★</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 cb:bg-cbBluishGreen/10 cb:dark:bg-cbBluishGreen/20 cb:border-cbBluishGreen/30 cb:dark:border-cbBluishGreen/40 rounded-lg max-w-4xl mx-auto">
        <div className="flex items-start space-x-3">
          <Award className="h-6 w-6 text-green-600 dark:text-green-400 cb:text-cbBluishGreen mt-1" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100 cb:text-cbBluishGreen cb:dark:text-cbBluishGreen mb-2">Our Mission</h3>
            <p className="text-green-800 dark:text-green-200 cb:text-cbBluishGreen cb:dark:text-cbBluishGreen">
              Empowering communities with knowledge and practical solutions for water conservation, sustainability, and
              environmental stewardship across the United Kingdom.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
