"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github } from "@/components/ui/github";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const GithubSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("github");
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      className="w-full h-11" 
      variant="outline" 
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <Github />
          Continue with GitHub
        </>
      )}
    </Button>
  );
};

export { GithubSignIn };
