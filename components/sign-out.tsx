"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const SignOut = () => {
  const handleSignOut = async () => {

    await signOut({redirect: false});
    window.location.href = "/"; 
  };


  return (
    <Button
      onClick={handleSignOut}
      className="cursor-pointer w-full justify-start px-2 py-2 text-left"
      variant="ghost"
    >
      Sign Out
    </Button>
  );
};

export { SignOut };
