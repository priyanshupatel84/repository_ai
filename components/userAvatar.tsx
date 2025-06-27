"use client";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility
import { useSession } from "next-auth/react";
import { HTMLAttributes } from "react";

interface UserAvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function UserAvatar({ size = 40, className }: UserAvatarProps) {
  const {data : session} = useSession();
  const email = session?.user.email
  // Get the first letter of the email username
  const getInitial = () => {
    if (!email) return "?";
    const [username] = email.split("@");
    return username?.[0]?.toUpperCase() || "?";
  };

  // Generate consistent background color from email
  const generateColor = () => {
    if (!email) return "#cccccc";
    const hue = Array.from(email).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    ) % 360;
    return `hsl(${hue}, 120%, 60%)`;
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center font-medium text-white shadow-sm",
        className
      )}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: generateColor(),
        fontSize: size * 0.4,
      }}
      title={email}
    >
      {getInitial()}
    </div>
  );
}
