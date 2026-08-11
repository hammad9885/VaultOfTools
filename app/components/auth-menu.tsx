"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, LogOut, User as UserIcon, FileText } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

function getInitials(name: string, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "";
  const parts = source.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function Avatar({
  src,
  name,
  email,
  size = 32,
  className = "",
}: {
  src?: string;
  name: string;
  email?: string;
  size?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(src) && !broken;

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-semibold leading-none text-white shadow-sm ring-2 ring-white ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {showImage ? (
        <Image
          src={src!}
          alt={name}
          width={size}
          height={size}
          className="size-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="tracking-tight">{getInitials(name, email)}</span>
      )}
    </span>
  );
}

export function AuthMenu() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted" />;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
      >
        Sign In
      </button>
    );
  }

  const name = user.displayName ?? user.email?.split("@")[0] ?? "Account";
  const avatar = user.photoURL ?? undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2 rounded-full border border-transparent p-0 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:border-border sm:bg-card sm:p-1 sm:pr-2.5 sm:hover:border-primary/40 sm:hover:shadow-sm sm:data-[state=open]:border-primary/50 sm:data-[state=open]:shadow-sm"
          aria-label="Open account menu"
        >
          <Avatar
            src={avatar}
            name={name}
            email={user.email}
            size={34}
            className="transition-transform group-hover:scale-[1.03]"
          />
          <span className="hidden max-w-[120px] truncate text-sm font-medium text-foreground sm:inline">
            {name}
          </span>
          <ChevronDown className="hidden size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-64 rounded-xl p-1.5">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2.5">
          <Avatar src={avatar} name={name} email={user.email} size={40} />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            {user.email && (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/account")}
          className="cursor-pointer gap-2.5 rounded-lg px-2 py-2 text-sm"
        >
          <UserIcon className="size-4 text-muted-foreground" /> Account
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/account/submissions")}
          className="cursor-pointer gap-2.5 rounded-lg px-2 py-2 text-sm"
        >
          <FileText className="size-4 text-muted-foreground" /> My Submissions
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className="cursor-pointer gap-2.5 rounded-lg px-2 py-2 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
