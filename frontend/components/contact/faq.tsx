"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Search, HelpCircle, Star } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ContactForm } from "@/components/contact/contact-form"
import { QuestionForm } from "@/components/contact/question-form"

const faqCategories = [
  { id: "all", name: "All Questions", count: 8 },
  { id: "billing", name: "Billing & Payments", count: 2 },
  { id: "quality", name: "Water Quality", count: 2 },
  { id: "service", name: "Service Issues", count: 1 },
  { id: "emergency", name: "Emergencies", count: 1 },
  { id: "conservation", name: "Conservation", count: 1 },
  { id: "technical", name: "Technical", count: 1 },
]

const faqData = [
  {
    id: 1,
    category: "billing",
    question: "How can I reduce my water bill?",
    answer:
      "There are several ways to reduce your water bill: fix leaks promptly, install water-efficient appliances, take shorter showers, use full loads in washing machines and dishwashers, and consider water-saving devices like low-flow showerheads and dual-flush toilets. You can also apply for water meter installation if you don't have one, as this often reduces bills for smaller households.",
    popular: true,
    helpfulYes: 156,
    helpfulNo: 0,
  },
  {
    id: 2,
    category: "quality",
    question: "Is UK tap water safe to drink?",
    answer:
      "Yes, UK tap water is among the safest in the world. It's strictly regulated and tested daily by water companies and independently monitored by the Drinking Water Inspectorate. The water meets or exceeds all EU and WHO standards. If you notice any unusual taste, smell, or appearance, contact your water company immediately.",
    popular: true,
    helpfulYes: 203,
    helpfulNo: 0,
  },
  {
    id: 3,
    category: "service",
    question: "What should I do if I have no water supply?",
    answer:
      "First, check if it's a planned outage by visiting your water company's website or calling them. Check if neighbors are affected. If it's just your property, check your stop tap is fully open and look for any obvious leaks. For emergency outages affecting multiple properties, contact your water company immediately. They're required to provide alternative water supplies for outages lasting more than 24 hours.",
    popular: false,
    helpfulYes: 89,
    helpfulNo: 0,
  },
  {
    id: 4,
    category: "emergency",
    question: "Who do I call for a water emergency?",
    answer:
      "For life-threatening emergencies involving water (like major flooding), call 999. For urgent water supply issues, burst mains, or sewage problems, call your water company's 24/7 emergency line. For flooding from rivers or seas, call the Environment Agency Floodline on 0345 988 1188. Keep these numbers handy and report emergencies immediately.",
    popular: true,
    helpfulYes: 134,
    helpfulNo: 0,
  },
  {
    id: 5,
    category: "quality",
    question: "Why does my water taste or smell different?",
    answer:
      "Taste and smell changes can be due to seasonal variations, maintenance work, or changes in treatment processes. Common causes include chlorine (normal for disinfection), earthy tastes (from algae in reservoirs), or metallic tastes (from old pipes). Most are harmless, but if you're concerned, contact your water company for advice and possible testing.",
    popular: false,
    helpfulYes: 67,
    helpfulNo: 0,
  },
  {
    id: 6,
    category: "conservation",
    question: "How much water should I use per day?",
    answer:
      "The average person in the UK uses about 150 liters per day, but the government target is to reduce this to 110 liters by 2050. Essential uses include drinking (2-3 liters), cooking, washing, and sanitation. You can track your usage through smart meters or water company apps, and many companies offer free water-saving devices to help reduce consumption.",
    popular: false,
    helpfulYes: 78,
    helpfulNo: 0,
  },
  {
    id: 7,
    category: "technical",
    question: "How do I read my water meter?",
    answer:
      "Water meters usually show usage in cubic meters (m³). Read the black numbers from left to right - these show whole cubic meters used. Red numbers or dials show fractions. Take readings at the same time each month for accurate monitoring. Many newer meters are smart meters that send readings automatically. Your water company can provide specific guidance for your meter type.",
    popular: false,
    helpfulYes: 92,
    helpfulNo: 0,
  },
  {
    id: 8,
    category: "billing",
    question: "Can I get help paying my water bill?",
    answer:
      "Yes, water companies offer various support schemes: WaterSure caps bills for large families or those with medical conditions requiring extra water; social tariffs provide discounts for low-income households; payment plans spread costs over time; and hardship funds offer emergency assistance. Contact your water company to discuss available options - they have a duty to help customers in financial difficulty.",
    popular: true,
    helpfulYes: 145,
    helpfulNo: 0,
  },
]

export function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const [helpfulCounts, setHelpfulCounts] = useState(() =>
    Object.fromEntries(
      faqData.map((faq) => [faq.id, { yes: faq.helpfulYes, no: faq.helpfulNo }])
    ) as Record<number, { yes: number; no: number }>
  )
  const [userVotes, setUserVotes] =
    useState<Record<number, "yes" | "no" | null>>({})

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    const matchesSearch =
      searchTerm === "" ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleHelpful = (id: number, type: "yes" | "no") => {
    const currentVote = userVotes[id]

    setHelpfulCounts((prev) => {
      const counts = { ...prev[id] }

      if (currentVote === type) {
        // toggle off
        counts[type] = Math.max(counts[type] - 1, 0)
      } else {
        if (currentVote) {
          counts[currentVote] = Math.max(counts[currentVote] - 1, 0)
        }
        counts[type] += 1
      }

      return { ...prev, [id]: counts }
    })

    setUserVotes((prev) => ({
      ...prev,
      [id]: currentVote === type ? null : type,
    }))
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardTitle className="text-2xl font-bold flex items-center">
          <HelpCircle className="h-6 w-6 mr-3" />
          Frequently Asked Questions
        </CardTitle>
        <p className="text-purple-100">Find quick answers to common water-related questions</p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Search and Categories */}
        <div className="space-y-6 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search frequently asked questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {faqCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs"
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isExpanded = expandedItems.includes(faq.id)

              return (
                <div key={faq.id} className="border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <button
                    className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    onClick={() => toggleExpanded(faq.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                          {faq.popular && <Badge className="bg-orange-600 text-white text-xs">Popular</Badge>}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="capitalize">{faq.category.replace("-", " ")}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{helpfulCounts[faq.id]?.yes ?? faq.helpfulYes} found helpful</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-gray-700 leading-relaxed mb-4">{faq.answer}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">Was this helpful?</div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={userVotes[faq.id] === "yes" ? "default" : "outline"}
                              size="sm"
                              className="text-xs"
                              onClick={() => handleHelpful(faq.id, "yes")}
                            >
                              👍 Yes ({helpfulCounts[faq.id]?.yes ?? 0})
                            </Button>
                            <Button
                              variant={userVotes[faq.id] === "no" ? "default" : "outline"}
                              size="sm"
                              className="text-xs"
                              onClick={() => handleHelpful(faq.id, "no")}
                            >
                              👎 No ({helpfulCounts[faq.id]?.no ?? 0})
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <HelpCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">Still need help?</h3>
            <p className="text-blue-800 text-sm mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">Contact Support</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contact Support</DialogTitle>
                  </DialogHeader>
                  <ContactForm />
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Submit a Question</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit a Question</DialogTitle>
                  </DialogHeader>
                  <QuestionForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
