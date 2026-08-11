"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, User as UserIcon, FileText } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export function AuthMenu() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="size-9 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
      >
        Sign In
      </button>
    );
  }

  const name = user.displayName ?? user.email?.split("@")[0] ?? "Account";
  const avatar = user.photoURL ?? undefined;
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 py-1 hover:border-primary/40 transition"
          aria-label="Open account menu"
        >
          <span className="size-8 rounded-full bg-primary-muted text-primary grid place-items-center font-semibold text-sm overflow-hidden ring-1 ring-border">
            {avatar ? (
              <Image
                src={avatar}
                alt={name}
                width={32}
                height={32}
                className="size-full object-cover"
              />
            ) : (
              initial
            )}
          </span>
          <span className="hidden sm:inline max-w-[120px] truncate text-sm font-medium text-foreground">
            {name}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/account")}
          className="cursor-pointer gap-2"
        >
          <UserIcon className="size-4" /> Account
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/account/submissions")}
          className="cursor-pointer gap-2"
        >
          <FileText className="size-4" /> My Submissions
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="size-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
