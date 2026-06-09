"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Bookmark } from "./bookmark-list";

type AddProps = {
  mode: "add";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (bookmark: Bookmark) => void;
  bookmark?: never;
  onEdit?: never;
};

type EditProps = {
  mode: "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onAdd?: never;
};

type Props = AddProps | EditProps;

export function BookmarkModal(props: Props) {
  const { mode, open, onOpenChange } = props;

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ title: "", url: "" });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && props.bookmark) {
      setTitle(props.bookmark.title);
      setUrl(props.bookmark.url);
      setIsPublic(props.bookmark.isPublic);
    } else {
      setTitle("");
      setUrl("");
      setIsPublic(false);
    }
    setErrors({ title: "", url: "" });
  }, [open]);

  async function handleSubmit() {
    const newErrors = { title: "", url: "" };
    if (!title.trim()) newErrors.title = "Title is required";
    if (!url.trim()) newErrors.url = "URL is required";
    if (newErrors.title || newErrors.url) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        mode === "add"
          ? "/api/bookmarks"
          : `/api/bookmarks/${props.bookmark.id}`;
      const method = mode === "add" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), url: url.trim(), isPublic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");

      if (mode === "add") {
        toast.success("Bookmark added!");
        props.onAdd(data as Bookmark);
      } else {
        toast.success("Bookmark updated!");
        props.onEdit(data as Bookmark);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[1rem] font-semibold">
            {mode === "add" ? "Add bookmark" : "Edit bookmark"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label
              htmlFor="bm-title"
              className="text-[0.85rem] font-semibold"
            >
              Title
            </Label>
            <Input
              id="bm-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My favourite article"
              aria-invalid={!!errors.title}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="bm-url"
              className="text-[0.85rem] font-semibold"
            >
              URL
            </Label>
            <Input
              id="bm-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              type="url"
              aria-invalid={!!errors.url}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div className="space-y-0.5">
              <p className="text-[0.85rem] font-semibold">Make public</p>
              <p className="text-xs text-muted-foreground">
                Anyone with the link can view this bookmark
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked)}
              className="cursor-pointer"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading
              ? mode === "add"
                ? "Adding…"
                : "Saving…"
              : mode === "add"
                ? "Add bookmark"
                : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
