"use client";
import Link from "next/link";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { AutoTypingResume } from "home/AutoTypingResume";

export const Hero = () => {
  const handleBackToResumia = () => {
    window.location.href = 'http://localhost:3000';
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <button
          onClick={handleBackToResumia}
          className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-white hover:bg-white/20 transition-colors mb-8"
          aria-label="Back to Resumia"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="lg:flex lg:items-center lg:justify-between lg:gap-12">
          <FlexboxSpacer maxWidth={75} minWidth={0} className="hidden lg:block" />
          <div className="mx-auto max-w-xl pt-8 text-center lg:mx-0 lg:grow lg:pt-0 lg:text-left">
            <div className="inline-flex items-center px-4 py-2 glass rounded-full text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              AI-Powered Resume Builder
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Create Your
              <span className="block text-primary">
                Dream Resume
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-10 leading-relaxed">
              With this free, open-source, and powerful resume builder. Build professional resumes in minutes.
            </p>
            <Link href="/resume-import" className="btn-primary group relative">
              <span className="relative z-10">Create Resume <span aria-hidden="true">→</span></span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </Link>
          </div>
          <FlexboxSpacer maxWidth={100} minWidth={50} className="hidden lg:block" />
          <div className="mt-6 flex justify-center lg:mt-4 lg:block lg:grow">
            <AutoTypingResume />
          </div>
        </div>
      </div>
    </section>
  );
};
