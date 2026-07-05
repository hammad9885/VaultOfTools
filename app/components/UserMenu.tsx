"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Shield, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";

interface Props {
  onOpenLogin: () => void;
}

export default function UserMenu({ onOpenLogin }: Props) {
  const { user, role, logOut, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenLogin}
          className="hidden sm:block text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={onOpenLogin}
          className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors"
      >
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName ?? "User"}
            width={32}
            height={32}
            className="rounded-full ring-2 ring-violet-100"
          />
        ) : (
          <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-violet-600" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-24 truncate">
          {user.displayName?.split(" ")[0]}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-50">
              <div className="font-semibold text-gray-900 text-sm truncate">{user.displayName}</div>
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
              {role === "admin" && (
                <span className="inline-flex items-center gap-1 text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full mt-1">
                  <Shield size={10} /> Admin
                </span>
              )}
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {role === "admin" && (
                <a
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-violet-600 hover:bg-violet-50 rounded-xl transition-colors font-medium"
                  onClick={() => setOpen(false)}
                >
                  <Shield size={16} />
                  Admin Dashboard
                </a>
              )}
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                onClick={() => setOpen(false)}
              >
                <Settings size={16} />
                Settings
              </a>
              <button
                onClick={() => { logOut(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
