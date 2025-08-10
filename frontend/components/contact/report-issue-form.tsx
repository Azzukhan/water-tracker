import type React from "react"
import { useState } from "react"
import { API_BASE } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Camera, Send, CheckCircle } from "lucide-react"

export function ReportIssueForm() {
  const [issueData, setIssueData] = useState({
    issueType: "",
    location: "",
    postcode: "",
    description: "",
    severity: "",
    contactName: "",
    contactPhone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        issue_type: issueData.issueType,
        severity: issueData.severity,
        location: issueData.location,
        postcode: issueData.postcode,
        description: issueData.description,
        contact_name: issueData.contactName,
        contact_phone: issueData.contactPhone,
      }

      const res = await fetch(`${API_BASE}/api/support/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Failed to submit")

      setSubmitStatus("success")
      setIssueData({
        issueType: "",
        location: "",
        postcode: "",
        description: "",
        severity: "",
        contactName: "",
        contactPhone: "",
      })
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } catch (err) {
      setSubmitStatus("error")
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === "success") {
    return (
      <Card className="shadow-lg border-0 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 cb:bg-cbBluishGreen/10 cb:dark:bg-cbBluishGreen/20 cb:border-cbBluishGreen/30 cb:dark:border-cbBluishGreen/40">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 cb:text-cbBluishGreen cb:dark:text-cbBluishGreen mx-auto mb-4" />
          <h3 className="text-lg font-bold text-green-900 dark:text-green-100 cb:text-cbBluishGreen cb:dark:text-cbBluishGreen mb-2">Issue Reported Successfully!</h3>
          <p className="text-green-800 dark:text-green-200 cb:text-cbBluishGreen cb:dark:text-cbBluishGreen text-sm mb-3">Your report has been submitted to the relevant water authority.</p>
          <div className="text-xs text-green-700 dark:text-green-300 cb:text-cbBluishGreen cb:dark:text-cbBluishGreen">
            Report ID: <span className="font-mono">WQR-{Date.now().toString().slice(-6)}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0 flex flex-col h-full min-h-[600px] lg:min-h-[720px]">
      <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 cb:from-cbVermillion cb:to-cbOrange dark:cb:from-cbVermillion dark:cb:to-cbOrange text-white">
        <CardTitle className="text-2xl font-bold flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Report Water Issue
        </CardTitle>
        <p className="text-red-100 dark:text-red-200 cb:text-cbVermillion text-sm">Report water quality or service problems</p>
      </CardHeader>
      <CardContent className="p-8 flex flex-col flex-1">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          {/* GROWABLE FIELDS */}
          <div className="flex-1 flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Issue Type *</label>
              <Select
                value={issueData.issueType}
                onValueChange={(value) => setIssueData((prev) => ({ ...prev, issueType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="water-quality">Water Quality</SelectItem>
                  <SelectItem value="no-water">No Water Supply</SelectItem>
                  <SelectItem value="low-pressure">Low Water Pressure</SelectItem>
                  <SelectItem value="burst-pipe">Burst Pipe/Leak</SelectItem>
                  <SelectItem value="sewage">Sewage Problem</SelectItem>
                  <SelectItem value="flooding">Flooding</SelectItem>
                  <SelectItem value="billing">Billing Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Severity *</label>
              <Select
                value={issueData.severity}
                onValueChange={(value) => setIssueData((prev) => ({ ...prev, severity: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Location *</label>
              <Input
                placeholder="Street address or landmark"
                value={issueData.location}
                onChange={(e) => setIssueData((prev) => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Postcode *</label>
              <Input
                placeholder="e.g., SW1A 1AA"
                value={issueData.postcode}
                onChange={(e) => setIssueData((prev) => ({ ...prev, postcode: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Description *</label>
              <Textarea
                placeholder="Describe the issue in detail..."
                rows={3}
                value={issueData.description}
                onChange={(e) => setIssueData((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Your Name</label>
              <Input
                placeholder="Contact name"
                value={issueData.contactName}
                onChange={(e) => setIssueData((prev) => ({ ...prev, contactName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Phone Number</label>
              <Input
                type="tel"
                placeholder="Contact phone"
                value={issueData.contactPhone}
                onChange={(e) => setIssueData((prev) => ({ ...prev, contactPhone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Photos (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                <Camera className="h-6 w-6 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">Upload photos of the issue</div>
                <input type="file" multiple accept="image/*" className="hidden" id="issue-photo-upload" />
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="issue-photo-upload" className="cursor-pointer">
                    Add Photos
                  </label>
                </Button>
              </div>
            </div>
          </div>
          {/* BUTTON AND NOTICE - Always at the bottom */}
          <Button type="submit" className="w-full bg-red-600 cb:bg-cbVermillion hover:bg-red-700 cb:hover:bg-cbVermillion/90 dark:hover:bg-red-500 dark:cb:hover:bg-cbVermillion/80 mt-6" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Submitting Report...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 cb:bg-cbVermillion/10 cb:dark:bg-cbVermillion/20 cb:border-cbVermillion/30 cb:dark:border-cbVermillion/40 rounded-lg mt-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 cb:text-cbVermillion mt-0.5" />
              <div className="text-xs text-red-800 dark:text-red-200 cb:text-cbVermillion">
                <strong>Emergency?</strong> For immediate assistance with water emergencies, call 999 or your local
                water authority directly.
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
