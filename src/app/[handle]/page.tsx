import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  params: Promise<{ handle: string }>;
}

export default async function HandlePage({ params }: Props) {
  const { handle } = await params;

  const profile = await prisma.profile.findUnique({ where: { handle } });

  if (!profile) {
    notFound();
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: profile.userId, isPublic: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          @{profile.handle}
        </h1>

        {bookmarks.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            This user hasn&apos;t shared any bookmarks yet.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map(
              (bookmark: { id: string; title: string; url: string }) => (
                <Card key={bookmark.id} className="flex flex-col">
                  <CardContent className="flex flex-1 flex-col gap-3 p-4">
                    <h3 className="line-clamp-2 text-[0.9rem] font-semibold leading-snug">
                      {bookmark.title}
                    </h3>

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
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        )}
      </main>
    </div>
  );
}
