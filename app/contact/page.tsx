"use client"

import { ContactHeader } from "@/components/contact/contact-header"
import { EmergencyContacts } from "@/components/contact/emergency-contacts"
import { ContactForm } from "@/components/contact/contact-form"
import { ReportIssueForm } from "@/components/contact/report-issue-form"
import { AgencyContacts } from "@/components/contact/agency-contacts"
import { FAQ } from "@/components/contact/faq"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <ContactHeader />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ContactForm />
          <AgencyContacts />
          <FAQ />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <EmergencyContacts />
          <ReportIssueForm />
        </div>
      </div>
    </div>
  )
}
