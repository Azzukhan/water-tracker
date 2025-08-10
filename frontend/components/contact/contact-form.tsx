import type React from "react"
import { useState } from "react"
import { API_BASE } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MessageCircle, Send, CheckCircle, Upload } from "lucide-react"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
    urgent: false,
    newsletter: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/api/support/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to submit")

      setSubmitStatus("success")
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: "",
        urgent: false,
        newsletter: false,
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
      <Card className="shadow-lg border-0 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">Message Sent Successfully!</h3>
          <p className="text-green-800 dark:text-green-200 mb-4">
            Thank you for contacting us. We'll respond to your inquiry within 24 hours during business days.
          </p>
          <div className="text-sm text-green-700 dark:text-green-300">
            Reference ID: <span className="font-mono">WTR-{Date.now().toString().slice(-6)}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0 flex flex-col h-full min-h-[600px] lg:min-h-[720px]">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 text-white">
        <CardTitle className="text-2xl font-bold flex items-center">
          <MessageCircle className="h-6 w-6 mr-3" />
          General Contact Form
        </CardTitle>
        <p className="text-blue-100 dark:text-blue-200">Send us your questions, feedback, or general inquiries</p>
      </CardHeader>
      <CardContent className="p-8 flex flex-col flex-1">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          {/* GROWABLE FIELDS */}
          <div className="flex-1 flex flex-col space-y-6">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Full Name *</label>
                <Input
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Email Address *</label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="07123 456789"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Inquiry Category *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="water-quality">Water Quality</SelectItem>
                    <SelectItem value="service">Service Request</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Subject *</label>
              <Input
                placeholder="Brief description of your inquiry"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Message *</label>
              <Textarea
                placeholder="Please provide detailed information about your inquiry..."
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Attachments (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Upload relevant documents, images, or files</div>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  className="hidden"
                  id="contact-file-upload"
                />
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="contact-file-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={formData.urgent}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, urgent: checked as boolean }))}
                />
                <label htmlFor="urgent" className="text-sm text-gray-700 dark:text-gray-300">
                  This is an urgent inquiry requiring immediate attention
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newsletter"
                  checked={formData.newsletter}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, newsletter: checked as boolean }))}
                />
                <label htmlFor="newsletter" className="text-sm text-gray-700 dark:text-gray-300">
                  Subscribe to our newsletter for water updates and tips
                </label>
              </div>
            </div>
          </div>
          {/* BUTTON AND NOTICE - Always at the bottom */}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 py-3 mt-6" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Sending Message...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-4">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Privacy Notice:</strong> Your personal information will be used solely to respond to your inquiry
              and will not be shared with third parties. We comply with UK GDPR regulations.
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
