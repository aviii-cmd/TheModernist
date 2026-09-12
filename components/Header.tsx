"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/types";

const NAV_LINKS = [{ href: "/", label: "Home" }, ...CATEGORIES.map((c) => ({ href: `/${c.value}`, label: c.navLabel }))];

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 16L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M2 5H18M2 10H18M2 15H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-grid items-center justify-between gap-4 px-5 py-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-ink">
            The Modernist
          </Link>
          <span className="hidden h-4 w-px bg-border-strong lg:block" aria-hidden />
          <span className="hidden font-sans text-[11px] uppercase tracking-[0.08em] text-ink-secondary lg:block">
            The independent student publication of MDIS.
          </span>
        </div>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative pb-1 text-[15px] transition-colors ${
                  active ? "text-ink" : "text-ink-secondary hover:text-ink"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-accent" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            aria-label="Search"
            className="hidden rounded p-1.5 text-ink-secondary transition-colors hover:text-ink md:inline-flex"
          >
            <SearchIcon />
          </Link>
          <Link
            href="/submit"
            className="hidden rounded bg-ink900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink900/90 md:inline-block"
          >
            Submit a Story
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded p-1.5 text-ink md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3.5" aria-label="Primary mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-[15px] ${pathname === link.href ? "text-ink font-medium" : "text-ink-secondary"}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/search"
              onClick={() => setMenuOpen(false)}
              className="text-[15px] text-ink-secondary"
            >
              Search
            </Link>
          </nav>
          <Link
            href="/submit"
            onClick={() => setMenuOpen(false)}
            className="mt-4 block rounded bg-ink900 px-4 py-2.5 text-center text-sm font-medium text-white"
          >
            Submit a Story
          </Link>
        </div>
      )}
    </header>
  );
}
