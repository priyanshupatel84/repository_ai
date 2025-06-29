import type React from "react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

      <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-lg">{children}</div>
      </div>
  );
}

