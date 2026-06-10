import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Bookmarks App</h1>
      <p className="mt-3 text-muted-foreground">
        Save and share your favourite links
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/signup"
          className={buttonVariants({ size: "lg", className: "cursor-pointer" })}
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "cursor-pointer",
          })}
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
