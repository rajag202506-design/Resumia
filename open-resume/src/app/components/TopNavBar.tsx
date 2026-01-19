"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoSrc from "public/logo.svg";
import { cx } from "lib/cx";

export const TopNavBar = () => {
  const pathName = usePathname();
  const router = useRouter();
  const isHomePage = pathName === "/";
  const isFromResumia = typeof window !== 'undefined' && document.referrer.includes('localhost:3000');

  const handleBackToResumia = () => {
    window.location.href = 'http://localhost:3000';
  };

  return (
    <header
      aria-label="Site Header"
      className="flex h-[var(--top-nav-bar-height)] items-center border-b border-white/20 px-3 lg:px-12 gradient-bg"
    >
      <div className="flex h-10 w-full items-center justify-between">
        <div className="flex items-center gap-4">
          {isFromResumia && (
            <button
              onClick={handleBackToResumia}
              className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-white hover:bg-white/20 transition-colors"
              aria-label="Back to Resumia"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Back to Resumia</span>
            </button>
          )}
          <Link href="/">
            <span className="sr-only">Resumia Builder</span>
            <Image
              src={logoSrc}
              alt="Resumia Builder Logo"
              className="h-8 w-full brightness-0 invert"
              priority
            />
          </Link>
        </div>
        <nav
          aria-label="Site Nav Bar"
          className="flex items-center gap-2 text-sm font-medium"
        >
          {[
            ["/resume-builder", "Builder"],
            ["/resume-parser", "Parser"],
          ].map(([href, text]) => (
            <Link
              key={text}
              className="rounded-xl px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white focus-visible:bg-white/10 transition-colors"
              href={href}
            >
              {text}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
