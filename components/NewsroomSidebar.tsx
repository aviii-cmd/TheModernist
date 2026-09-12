"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/types";

const LINKS = [
  { href: "/newsroom", label: "Overview", exact: true },
  { href: "/newsroom/articles", label: "Articles" },
  { href: "/newsroom/submissions", label: "Submissions" },
  { href: "/newsroom/authors", label: "Authors" },
  { href: "/newsroom/media", label: "Media" },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`block rounded px-3 py-2 text-[14.5px] transition-colors ${
              active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/newsroom/articles/new"
        onClick={onNavigate}
        className="mt-3 block rounded bg-white px-3 py-2 text-center text-[14.5px] font-medium text-ink900 hover:bg-white/90"
      >
        + New Article
      </Link>
    </>
  );
}

function ProfileBlock({ profile }: { profile: Profile | null }) {
  return (
    <div>
      {profile && (
        <p className="text-[13px] text-white/70">
          {profile.name}
          <span className="mx-1.5 text-white/30">·</span>
          <span className="capitalize">{profile.role}</span>
        </p>
      )}
      <form action={signOut}>
        <button type="submit" className="mt-1.5 text-[13px] text-white/50 hover:text-white">
          Sign out
        </button>
      </form>
    </div>
  );
}

export default function NewsroomSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: fixed vertical sidebar */}
      <div className="hidden w-60 shrink-0 flex-col bg-ink900 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="font-serif text-lg font-semibold text-white">The Modernist</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">Newsroom</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4" aria-label="Newsroom">
          <NavLinks pathname={pathname} />
        </nav>
        <div className="border-t border-white/10 px-5 py-4">
          <ProfileBlock profile={profile} />
        </div>
      </div>

      {/* Mobile: top bar with expandable menu */}
      <div className="sticky top-0 z-40 bg-ink900 lg:hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="font-serif text-lg font-semibold text-white">The Modernist</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">Newsroom</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="rounded p-1.5 text-white/80"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M2 5H18M2 10H18M2 15H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {open && (
          <div className="border-t border-white/10 px-3 py-3">
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <div className="mt-4 border-t border-white/10 px-2 pt-3">
              <ProfileBlock profile={profile} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
