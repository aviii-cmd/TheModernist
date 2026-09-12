import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/submit", label: "Submit a Story" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink900 text-white">
      <div className="mx-auto flex max-w-grid flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-xl font-semibold">The Modernist</span>
            <span className="hidden h-3.5 w-px bg-white/20 sm:block" aria-hidden />
            <span className="hidden text-[11px] uppercase tracking-[0.08em] text-white/50 sm:block">
              The independent student publication of MDIS.
            </span>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-white/70 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-sm text-white/50">Built by students, for students.</p>
      </div>
    </footer>
  );
}
