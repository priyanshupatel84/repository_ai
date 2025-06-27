"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import useProjects from "@/hooks/use-project";
import React from "react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

export const DeleteButton = () => {
  const { projectId, mutate } = useProjects();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!projectId) return;
    
    setIsDeleting(true);
    try {
      await axios.delete("/api/deleteProject", {
        data: { projectId } // Send projectId in request body
      });
      toast.success("Project deleted successfully");
      await mutate();
      setIsOpen(false);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="hover:text-destructive-foreground hover:bg-destructive border-destructive/20 hover:border-destructive transition-colors cursor-pointer">
          Delete
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to delete this project? This action cannot be undone.
            <br />
            <strong>All related data will be permanently removed.</strong>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
