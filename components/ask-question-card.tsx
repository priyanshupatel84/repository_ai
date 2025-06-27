"use client"
import MDEditor from "@uiw/react-md-editor"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import useProjects from "@/hooks/use-project"
import { useState } from "react"
import { askQuestion } from "@/lib/action"
import { readStreamableValue } from "ai/rsc"
import CodeReferences from "./code-references"
import axios from "axios"
import { toast } from "sonner"
import { useSavedAnswers } from "@/hooks/useSavedAnser"

const AskQuestionCard = () => {
  const { project, mutate: mutateProjects } = useProjects()
  const { mutate: mutateSavedAnswers } = useSavedAnswers(project?.id || "")

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [question, setQuestion] = useState("")
  const [fileReferences, setFileReferences] = useState<{ fileName: string; sourceCode: string; summary: string }[]>([])
  const [answer, setAnswer] = useState("")

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!project?.id) return

    setLoading(true)
    setFileReferences([])
    setAnswer("")

    try {
      const { output, fileReferences, error } = await askQuestion(question, project.id)

      setOpen(true)
      setFileReferences(fileReferences || [])

      if (typeof output !== "string") {
        for await (const delta of readStreamableValue(output)) {
          if (delta) {
            setAnswer((prev) => prev + delta)
          }
        }
      } else {
        setAnswer(output)
      }

      if (error === "NO_RELEVANT_FILES") {
        toast.info("No relevant code files found. Providing general assistance.")
      }
    } catch (error) {
      console.error("Error:", error)
      setAnswer("Sorry, there was an error processing your request. Please try again.")
      setOpen(true)
      setFileReferences([])
      toast.error("An error occurred while processing your question.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAnswer = async () => {
    if (!project?.id) return
    setSaveLoading(true)

    try {
      await axios.post("/api/saveAnswer", {
        projectId: project.id,
        question,
        answer,
        filesReferences: fileReferences,
      })

      await Promise.all([mutateProjects(), mutateSavedAnswers()])
      toast.success("Answer saved successfully")
    } catch (error) {
      console.error("Error saving answer:", error)
      toast.error(
        axios.isAxiosError(error) ? error.response?.data?.error || "Error saving answer" : "Error saving answer",
      )
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium">{question}</DialogTitle>
              <div className="flex space-x-2">
                <Button disabled={saveLoading} variant="outline" size="sm" onClick={handleSaveAnswer}>
                  {saveLoading ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <MDEditor.Markdown
                source={answer}
                style={{
                  backgroundColor: "transparent",
                  color: "inherit",
                  fontFamily: "inherit",
                }}
              />
            </div>
            {fileReferences.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Code References</h3>
                <CodeReferences fileReferences={fileReferences} />
              </div>
            )}
            {fileReferences.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-700">
                  This answer was generated without specific code context. For more precise answers about your codebase,
                  try asking about specific files or functions.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Textarea
              placeholder="Which file should I edit to modify the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <Button type="submit" disabled={loading || !question.trim()} className="w-full sm:w-auto">
              {loading ? "Processing..." : "Ask Question"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default AskQuestionCard
