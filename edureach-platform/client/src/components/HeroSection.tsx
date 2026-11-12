import { GraduationCap } from "lucide-react";
import { images, siteConfig } from "../data/content";

interface HeroSectionProps {
  onOpenAdmissionModal?: () => void;
}

export default function HeroSection({ onOpenAdmissionModal }: HeroSectionProps) {
  return (
    <section id="hero" className="relative h-[85vh] min-h-[520px]">
      <img src={images.hero} alt="EduReach Campus" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-maroon/75" />

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-white text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            EduReach College Session 2024–25 Admissions Open
          </div>

          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl text-white font-bold leading-tight mb-4">
            Welcome to <br />
            <span className="text-amber-300">{siteConfig.name} College</span>
          </h1>

          <p className="text-white/80 text-sm tracking-widest uppercase mb-4">
            {siteConfig.established} · Hyderabad, Telangana · NAAC A++ Accredited
          </p>

          <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
            {siteConfig.tagline}. Premier engineering and management institution with 92% placement rate
            and recruitment partnerships with Google, Microsoft & Amazon.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenAdmissionModal}
              className="bg-amber-400 text-slate-950 px-7 py-3.5 rounded-xl font-bold hover:bg-amber-300 transition-all duration-300 shadow-xl flex items-center gap-2.5 text-sm"
            >
              <GraduationCap className="w-5 h-5 text-maroon" /> Apply for Admission
            </button>
            <a
              href="#courses"
              className="inline-block bg-white/15 text-white border border-white/30 px-6 py-3.5 rounded-xl font-semibold hover:bg-white hover:text-maroon transition-all duration-300 text-sm backdrop-blur-sm"
            >
              Explore Programs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
