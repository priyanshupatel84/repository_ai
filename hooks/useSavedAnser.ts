// hooks/use-saved-answers.ts
import useSWR from "swr";
import axios from "axios";

interface SavedAnswer {
  id: string;
  question: string;
  answer: string;
  filesReferences: Array<{ fileName: string; sourceCode: string; summary: string }>;
  createdAt: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function useSavedAnswers(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR<SavedAnswer[]>(
    projectId ? `/api/getQuestion/${projectId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    }
  );

  return {
    savedAnswers: data || [],
    isLoading,
    error,
    mutate
  };
}
