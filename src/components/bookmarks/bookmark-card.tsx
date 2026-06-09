"use client";

import { useState } from "react";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookmarkModal } from "./bookmark-modal";
import type { Bookmark } from "./bookmark-list";

type Props = {
  bookmark: Bookmark;
  onEdit: (updated: Bookmark) => void;
  onDelete: (id: string) => void;
};

export function BookmarkCard({ bookmark, onEdit, onDelete }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to delete");
      }
      toast.success("Bookmark deleted");
      onDelete(bookmark.id);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete bookmark"
      );
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[0.9rem] font-semibold leading-snug">
              {bookmark.title}
            </h3>
            <Badge
              variant={bookmark.isPublic ? "secondary" : "outline"}
              className="shrink-0"
            >
              {bookmark.isPublic ? "Public" : "Private"}
            </Badge>
          </div>

          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3 shrink-0" />
            <span className="truncate underline-offset-2 group-hover:underline">
              {bookmark.url}
            </span>
          </a>

          <div className="mt-auto flex items-center justify-end gap-1 border-t border-border pt-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setEditOpen(true)}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              aria-label="Edit bookmark"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteOpen(true)}
              className="cursor-pointer text-muted-foreground hover:text-destructive"
              aria-label="Delete bookmark"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <BookmarkModal
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        bookmark={bookmark}
        onEdit={(updated) => {
          onEdit(updated);
          setEditOpen(false);
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete bookmark?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{bookmark.title}&rdquo; will be permanently removed. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/90 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
