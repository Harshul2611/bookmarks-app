import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [bookmarksRaw, profile] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  // Serialize Dates to strings for the client component boundary
  const bookmarks = bookmarksRaw.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  const handle = profile?.handle ?? "";

  async function logout() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-[0.95rem] font-semibold tracking-tight">
            Bookmark App
          </span>
          <div className="flex items-center gap-3">
            {handle && (
              <span className="text-sm text-muted-foreground">@{handle}</span>
            )}
            <form action={logout}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5"
              >
                <LogOut className="size-3.5" />
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <BookmarkList initialBookmarks={bookmarks} handle={handle} />
      </main>
    </div>
  );
}
