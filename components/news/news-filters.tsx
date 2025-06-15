"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

const companies = [
  "All Companies",
  "Thames Water",
  "Scottish Water",
  "Anglian Water",
  "United Utilities",
  "Severn Trent",
  "Yorkshire Water",
  "South West Water",
  "Environment Agency",
  "SEPA",
  "Natural Resources Wales",
]

const regions = [
  "All Regions",
  "London",
  "South East",
  "South West",
  "North West",
  "North East",
  "Yorkshire",
  "Midlands",
  "Scotland",
  "Wales",
  "Northern Ireland",
]

const eventTypes = [
  "All Types",
  "Infrastructure",
  "Water Quality",
  "Environmental",
  "Regulatory",
  "Investment",
  "Emergency",
  "Maintenance",
  "Innovation",
  "Policy",
  "Drought",
  "Flooding",
]

export interface NewsFilterValues {
  searchTerm: string
  company: string
  region: string
  eventType: string
  dateRange: string
}

interface NewsFiltersProps {
  values: NewsFilterValues
  onValuesChange: (values: NewsFilterValues) => void
}

export function NewsFilters({ values, onValuesChange }: NewsFiltersProps) {
  const { searchTerm, company, region, eventType, dateRange } = values

  const setSearchTerm = (val: string) => onValuesChange({ ...values, searchTerm: val })
  const setSelectedCompany = (val: string) => onValuesChange({ ...values, company: val })
  const setSelectedRegion = (val: string) => onValuesChange({ ...values, region: val })
  const setSelectedEventType = (val: string) => onValuesChange({ ...values, eventType: val })
  const setDateRange = (val: string) => onValuesChange({ ...values, dateRange: val })

  const activeFilters = useMemo(
    () => [
      company !== "All Companies" && company,
      region !== "All Regions" && region,
      eventType !== "All Types" && eventType,
      dateRange !== "All Time" && dateRange,
    ].filter(Boolean),
    [company, region, eventType, dateRange]
  )

  const clearAllFilters = () => {
    onValuesChange({
      searchTerm: "",
      company: "All Companies",
      region: "All Regions",
      eventType: "All Types",
      dateRange: "All Time",
    })
  }

  const removeFilter = (filter: string) => {
    if (companies.includes(filter)) setSelectedCompany("All Companies")
    if (regions.includes(filter)) setSelectedRegion("All Regions")
    if (eventTypes.includes(filter)) setSelectedEventType("All Types")
    if (filter === dateRange) setDateRange("All Time")
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-slate-600 to-gray-700 text-white">
        <CardTitle className="text-xl font-bold flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filter News
        </CardTitle>
        <p className="text-slate-200">Find specific news stories and updates</p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search news headlines, companies, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Select value={company} onValueChange={setSelectedCompany}>
            <SelectTrigger>
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={region} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={eventType} onValueChange={setSelectedEventType}>
            <SelectTrigger>
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Time">All Time</SelectItem>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
              <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
              <SelectItem value="This Year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={clearAllFilters} className="flex items-center">
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-600 mr-2">Active filters:</span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="cursor-pointer hover:bg-red-100 hover:text-red-800 transition-colors"
                onClick={() => removeFilter(filter as string)}
              >
                {filter}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 mr-2">Quick filters:</span>
          <Button variant="outline" size="sm" onClick={() => setSelectedEventType("Emergency")} className="text-xs">
            Emergency Alerts
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedEventType("Investment")} className="text-xs">
            Investments
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDateRange("This Week")} className="text-xs">
            This Week
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedEventType("Water Quality")} className="text-xs">
            Water Quality
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
