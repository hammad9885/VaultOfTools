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
        onClick={() => router.push("/auth")}
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
          className="size-9 rounded-full bg-primary-muted text-primary grid place-items-center font-semibold text-sm overflow-hidden ring-1 ring-border hover:ring-primary/40 transition"
          aria-label="Open account menu"
        >
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={36}
              height={36}
              className="size-full object-cover"
            />
          ) : (
            initial
          )}
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
