"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function QuestionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast()
  const [data, setData] = useState({ email: "", question: "" })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Question submitted" })
      setData({ email: "", question: "" })
      onSuccess?.()
    } catch (err) {
      toast({ title: "Submission failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          required
          value={data.question}
          onChange={(e) => setData({ ...data, question: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
        {loading ? "Submitting..." : "Submit"}
      </Button>
    </form>
  )
}
