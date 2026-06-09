"use client";

import { useState } from "react";
import { Plus, Bookmark as BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkCard } from "./bookmark-card";
import { BookmarkModal } from "./bookmark-modal";

export type Bookmark = {
  id: string;
  userId: string;
  title: string;
  url: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  initialBookmarks: Bookmark[];
  handle: string;
};

export function BookmarkList({ initialBookmarks }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [isAddOpen, setIsAddOpen] = useState(false);

  function handleAdd(bookmark: Bookmark) {
    setBookmarks((prev) => [bookmark, ...prev]);
    setIsAddOpen(false);
  }

  function handleEdit(updated: Bookmark) {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
  }

  function handleDelete(id: string) {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[1.4rem] font-bold tracking-tight">
            My Bookmarks
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {bookmarks.length}{" "}
            {bookmarks.length === 1 ? "bookmark" : "bookmarks"}
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          size="sm"
          className="cursor-pointer gap-1.5"
        >
          <Plus className="size-3.5" />
          Add Bookmark
        </Button>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <BookmarkIcon className="mb-3 size-8 text-muted-foreground/40" />
          <p className="text-[0.9rem] font-medium text-muted-foreground">
            No bookmarks yet. Add your first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <BookmarkModal
        mode="add"
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAdd}
      />
    </div>
  );
}
