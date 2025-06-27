"use client";

import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

type Props = {
  fileReferences: { fileName: string; sourceCode: string; summary: string }[];
};

const CodeReferences = ({ fileReferences }: Props) => {
  
  const [tab, setTab] = useState(fileReferences[0]?.fileName);
  if (!fileReferences.length) return null;

  return (
    <div className="w-full max-w-[95vw] lg:max-w-[85vw] transition-all duration-300">
      <Tabs className="w-full space-y-4" value={tab} onValueChange={setTab}>
        <div className="sticky top-0 z-10">
          <div className="flex gap-2 overflow-x-auto rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-2 shadow-sm">
            {fileReferences.map((file) => (
              <button
                key={file.fileName}
                onClick={() => setTab(file.fileName)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  "hover:bg-white/90 dark:hover:bg-gray-700/90",
                  "ring-offset-2 focus:outline-none focus:ring-2 focus:ring-primary",
                  {
                    "bg-white dark:bg-gray-700 shadow-md scale-[1.02]": tab === file.fileName,
                    "text-gray-600 dark:text-gray-300": tab !== file.fileName,
                  }
                )}
              >
                {file.fileName}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
          {fileReferences.map((file) => (
            <TabsContent
              key={file.fileName}
              value={file.fileName}
              className="max-h-[65vh] overflow-auto rounded-xl"
            >
              <div className="p-1">
                <SyntaxHighlighter 
                  language="typescript" 
                  style={lucario}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.75rem',
                    fontSize: '0.95rem',
                  }}
                  showLineNumbers
                >
                  {file.sourceCode}
                </SyntaxHighlighter>
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default CodeReferences;
