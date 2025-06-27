"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const SignOut = () => {
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/',
    })
  };

  return (
    <div className="flex justify-center">
      <Button
        onClick={handleSignOut}
        className="cursor-pointer"
      >
        Sign Out
      </Button>
    </div>
  );
};

export { SignOut };
