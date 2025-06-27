"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useProjects from "@/hooks/use-project";
import React, { useState } from "react";
import AskQuestionCard from "@/components/ask-question-card";

import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "@/components/code-references";
import useSWR from "swr";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSavedAnswers } from "@/hooks/useSavedAnser";
import { ArrowLeft, Trash2 } from "lucide-react";
import { UserAvatar } from "@/components/userAvatar";

interface Question {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
  filesReferences: Array<{
    fileName: string;
    sourceCode: string;
    summary: string;
  }>;
  user: {
    imageUrl: string | null;
  };
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const QAPage = () => {
  const { projectId } = useProjects();
  const { mutate: mutateSavedAnswers } = useSavedAnswers(projectId || "");

  const { data: questions } = useSWR<Question[]>(
    projectId ? `/api/getQuestion/${projectId}` : null,
    fetcher
  );

  console.log("questions", questions);
  const [questionIndex, setQuestionIndex] = useState(0);

  const question = questions?.[questionIndex];

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await axios.delete("/api/deleteQuestion", {
        data: { questionId },
      });

      toast.success("Question deleted successfully");
      mutateSavedAnswers(); // Refresh the questions list
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to delete question"
          : "Failed to delete question"
      );
    }
  };

  return (
    <Sheet>
      <AskQuestionCard />

      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>

      <div className="flex flex-col gap-2">
        {questions?.map((q, index) => (
          <SheetTrigger
            key={q.id}
            onClick={() => setQuestionIndex(index)}
            className="text-left"
          >
            <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow hover:bg-gray-50 transition-colors">

              <UserAvatar className="h-8 w-8" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-medium text-gray-900 truncate">
                    {q.question}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{q.answer}</p>
              </div>
              <div className="flex items-center gap-2 justify-center">
                  <ArrowLeft className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </SheetTrigger>
        ))}
      </div>

      {question && (
        <SheetContent className="w-full sm:max-w-[80vw] overflow-y-auto">
          <SheetHeader className="space-y-6">
            <div className="flex justify-between items-center">
              <SheetTitle className="text-2xl font-bold text-gray-900">
                {question.question}
              </SheetTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteQuestion(question.id)}
                className="mr-7 cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Question
              </Button>
            </div>

            <div className="prose prose-lg max-w-none">
              <MDEditor.Markdown
                source={question.answer}
                style={{
                  backgroundColor: "#f5f5f5",
                  color: "#000",
                  borderRadius: "8px",
                  padding: "16px",
                  border: "1px solid #e0e0e0",
                  margin: "8px 0",
                  overflow: "hidden",
                  fontFamily: "Arial, sans-serif",
                }}
              />
            </div>
            <CodeReferences fileReferences={question.filesReferences || []} />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QAPage;
