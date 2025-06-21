"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Upload, CheckCircle, AlertCircle } from "lucide-react"

export function SubmitNewsForm() {
  const [formData, setFormData] = useState({
    headline: "",
    summary: "",
    company: "",
    region: "",
    eventType: "",
    source: "",
    contactName: "",
    contactEmail: "",
    attachments: [] as File[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus("success")
      // Reset form after success
      setTimeout(() => {
        setFormData({
          headline: "",
          summary: "",
          company: "",
          region: "",
          eventType: "",
          source: "",
          contactName: "",
          contactEmail: "",
          attachments: [],
        })
        setSubmitStatus("idle")
      }, 3000)
    }, 2000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }))
  }

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  if (submitStatus === "success") {
    return (
      <Card className="shadow-lg border-0 bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-900 mb-2">News Submitted Successfully!</h3>
          <p className="text-green-800 mb-4">
            Thank you for your submission. Our editorial team will review your news story and publish it if approved.
          </p>
          <Badge className="bg-green-600 text-white">Under Review</Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0 sticky top-24">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <CardTitle className="text-xl font-bold flex items-center">
          <PlusCircle className="h-5 w-5 mr-2" />
          Submit News
        </CardTitle>
        <p className="text-blue-100">Share water industry news with the community</p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Headline */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">News Headline *</label>
            <Input
              placeholder="Enter news headline..."
              value={formData.headline}
              onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))}
              required
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Summary *</label>
            <Textarea
              placeholder="Brief summary of the news story..."
              rows={4}
              value={formData.summary}
              onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
              required
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Company/Organization *</label>
            <Select
              value={formData.company}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, company: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scottish Water">Scottish Water</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Region *</label>
            <Select
              value={formData.region}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, region: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scotland">Scotland</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Event Type *</label>
            <Select
              value={formData.eventType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, eventType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                <SelectItem value="Water Quality">Water Quality</SelectItem>
                <SelectItem value="Environmental">Environmental</SelectItem>
                <SelectItem value="Regulatory">Regulatory</SelectItem>
                <SelectItem value="Investment">Investment</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Innovation">Innovation</SelectItem>
                <SelectItem value="Policy">Policy</SelectItem>
                <SelectItem value="Drought">Drought</SelectItem>
                <SelectItem value="Flooding">Flooding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">News Source</label>
          <Input
            placeholder="e.g., Company Press Release, BBC News..."
            value={formData.source}
            onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
          />
        </div>

        {/* Contact Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Contact Name *</label>
          <Input
            placeholder="Your name"
            value={formData.contactName}
            onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
            required
          />
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Contact Email *</label>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={formData.contactEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
              required
            />
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Attachments</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-2">Upload images, documents, or press releases</div>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Choose Files
                </label>
              </Button>
            </div>

            {/* Attachment List */}
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Submitting...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Submit News Story
              </>
            )}
          </Button>

          {/* Guidelines */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">Submission Guidelines</div>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>• Ensure all information is accurate and verifiable</li>
                  <li>• Include relevant sources and contact information</li>
                  <li>• News will be reviewed before publication</li>
                  <li>• We reserve the right to edit for clarity and length</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
