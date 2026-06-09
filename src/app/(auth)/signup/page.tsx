"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const HANDLE_REGEX = /^[a-z0-9_]{3,20}$/;

type FieldErrors = Partial<Record<"email" | "handle" | "password" | "form", string>>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  function validate(email: string, handle: string, password: string): FieldErrors {
    const e: FieldErrors = {};
    if (!email) e.email = "Email is required";
    if (!handle) {
      e.handle = "Handle is required";
    } else if (!HANDLE_REGEX.test(handle)) {
      e.handle = "3–20 characters: lowercase letters, numbers, and underscores only";
    }
    if (!password) {
      e.password = "Password is required";
    } else if (password.length < 8) {
      e.password = "Password must be at least 8 characters";
    }
    return e;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const handle = (form.elements.namedItem("handle") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const fieldErrors = validate(email, handle, password);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, handle, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const field = data.field as keyof FieldErrors | undefined;
        if (field) {
          setErrors({ [field]: data.error });
        } else {
          setErrors({ form: data.error || "Signup failed. Please try again." });
        }
        return;
      }

      if (data.requiresConfirmation) {
        toast.info("Check your email to confirm your account.");
        return;
      }

      toast.success("Account created! Welcome aboard.");
      router.push("/dashboard");
    } catch {
      setErrors({ form: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-[1.6rem] font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription className="text-[0.9rem] font-medium">
            Enter your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[0.85rem] font-semibold">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="handle" className="text-[0.85rem] font-semibold">
                Handle
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                  @
                </span>
                <Input
                  id="handle"
                  name="handle"
                  type="text"
                  placeholder="yourhandle"
                  autoComplete="username"
                  className="pl-7"
                  aria-invalid={!!errors.handle}
                />
              </div>
              {errors.handle ? (
                <p className="text-xs text-destructive">{errors.handle}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  3–20 chars · letters, numbers, underscores
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[0.85rem] font-semibold">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-10"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {errors.form && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errors.form}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-9 cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-[0.85rem] text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="cursor-pointer font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
