import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import {
  ArrowRight,
  Play,
  Sparkles,
  Mic,
  Wand2,
  Languages,
  Download,
  Clock,
  Check,
  Star,
  Quote,
} from "lucide-react";

/* =========================================================================
   NOTLEX — Isolated landing page prototype
   Self-contained: no app design tokens, no auth, no app routes used here.
   Tailwind + framer-motion + lucide only. Safe to extract to its own repo.
   ========================================================================= */

const CREAM = "#f5efe5";
const GREEN = "#0f5a3f";
const GREEN_LIGHT = "#19a575";

/* ----------------------------- NAV ----------------------------- */
function Nav() {
  const items = ["Home", "Features", "Pricing", "Blog", "Contact"];
  return (
    <header className="sticky top-4 z-50 mx-auto w-[min(1180px,92vw)]">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/70 px-5 py-3 shadow-[0_8px_30px_rgba(15,90,63,0.06)] backdrop-blur-xl"
      >
        <a href="#" className="flex items-center gap-2">
          <div
            className="grid h-7 w-7 place-items-center rounded-md"
            style={{ background: GREEN }}
          >
            <span className="text-[13px] font-bold text-white">N</span>
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-neutral-900">
            notlex
          </span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {items.map((label, i) => (
            <a
              key={label}
              href="#"
              className={`text-[14px] transition-colors ${
                i === 0
                  ? "font-semibold text-[--green]"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
              style={{ ["--green" as any]: GREEN }}
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          href="#"
          className="group flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-white transition-transform hover:scale-[1.03]"
          style={{ background: GREEN }}
        >
          Contact
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </motion.div>
    </header>
  );
}

/* ----------------------------- HERO ----------------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-12">
      {/* Background grain / abstract corners */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 10%, rgba(25,165,117,0.10), transparent 60%), radial-gradient(circle at 0% 0%, rgba(0,0,0,0.04), transparent 40%), radial-gradient(circle at 100% 0%, rgba(0,0,0,0.04), transparent 40%)",
          }}
        />
        <svg
          className="absolute left-0 top-0 h-full w-1/4 opacity-[0.12]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#000" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <svg
          className="absolute right-0 top-0 h-full w-1/4 opacity-[0.12]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="mx-auto w-[min(1180px,92vw)] text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-1 py-1 pr-3 shadow-sm"
        >
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
            style={{ background: GREEN }}
          >
            New
          </span>
          <span className="text-[12px] font-medium text-neutral-700">
            Automated Meeting Notes
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mx-auto mt-6 max-w-3xl font-serif text-[clamp(40px,6vw,72px)] font-medium leading-[1.05] tracking-tight text-neutral-900"
          style={{ fontFamily: "'Instrument Serif', 'Cormorant Garamond', serif" }}
        >
          Turn Meetings Into
          <br /> Actionable Notes
        </motion.h1>

        {/* Animated stripe ribbon — signature Notlex element */}
        <StripeRibbon />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-neutral-600"
        >
          Capture meetings, transcribe discussions, and generate structured notes
          without manual effort.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-7 flex items-center justify-center gap-3"
        >
          <a
            href="#"
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium text-white transition-all hover:shadow-lg"
            style={{ background: GREEN }}
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-6 py-3 text-[14px] font-medium text-neutral-800 backdrop-blur transition-colors hover:bg-white"
          >
            Book a demo
          </a>
        </motion.div>

        {/* Dashboard mockup placeholder */}
        <DashboardMock />
      </div>
    </section>
  );
}

/* Animated stripe ribbon mimicking Notlex's signature swooping bands */
function StripeRibbon() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[26%] -z-[1] h-[420px] w-[min(1180px,92vw)] -translate-x-1/2">
      <svg
        viewBox="0 0 1200 400"
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.path
            key={i}
            d={`M -50 ${120 + i * 12} Q 280 ${120 + i * 12} 360 ${260 + i * 12} L 840 ${260 + i * 12} Q 920 ${120 + i * 12} 1250 ${120 + i * 12}`}
            fill="none"
            stroke={GREEN_LIGHT}
            strokeOpacity={0.85 - i * 0.08}
            strokeWidth={2}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.06, duration: 1.2, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
}

function DashboardMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative mx-auto mt-16 max-w-5xl"
    >
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_30px_80px_-20px_rgba(15,90,63,0.25)]">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-black/5 bg-neutral-50/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              className="grid h-5 w-5 place-items-center rounded"
              style={{ background: GREEN }}
            >
              <span className="text-[9px] font-bold text-white">N</span>
            </div>
            <span className="text-[13px] font-semibold text-neutral-800">
              notlex
            </span>
          </div>
          <div className="hidden gap-2 md:flex">
            <Pill>Export Insights</Pill>
            <Pill>Manage Projects</Pill>
            <Pill>+ Create New Note</Pill>
            <Pill active>All Status</Pill>
          </div>
        </div>

        <div className="grid grid-cols-12">
          {/* Sidebar */}
          <aside className="col-span-3 hidden border-r border-black/5 p-4 md:block">
            <div className="mb-3 rounded-md bg-neutral-100 px-3 py-2 text-[12px] text-neutral-500">
              Search…
            </div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Main menu
            </div>
            {["Dashboard", "Notes", "Meetings", "Insights", "Action Items"].map(
              (label, i) => (
                <div
                  key={label}
                  className={`mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-[12px] ${
                    i === 1
                      ? "text-white"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                  style={i === 1 ? { background: GREEN } : undefined}
                >
                  <div className="h-3 w-3 rounded-sm bg-current opacity-40" />
                  {label}
                </div>
              ),
            )}
          </aside>

          {/* Main */}
          <div className="col-span-12 p-5 md:col-span-9">
            <div className="mb-1 text-[15px] font-semibold text-neutral-900">
              Notlex Notes Dashboard
            </div>
            <div className="mb-4 text-[12px] text-neutral-500">
              Capture, analyze, and manage research conversations in one place
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Total Notes", v: "86", sub: "AI-generated research notes" },
                { label: "Active Meetings", v: "14", sub: "Sessions currently processing" },
                { label: "Action Items", v: "32", sub: "Follow-ups identified by AI" },
                { label: "Insights Created", v: "58", sub: "Themes & patterns extracted" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-black/5 bg-white p-3"
                >
                  <div className="text-[11px] text-neutral-500">{s.label}</div>
                  <div className="my-1 text-[22px] font-semibold text-neutral-900">
                    {s.v}
                  </div>
                  <div className="text-[10px] text-neutral-400">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Faux chart */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="col-span-2 rounded-xl border border-black/5 bg-gradient-to-br from-emerald-50 to-white p-3">
                <svg viewBox="0 0 400 120" className="h-32 w-full">
                  <defs>
                    <linearGradient id="ch" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={GREEN_LIGHT} stopOpacity="0.5" />
                      <stop offset="100%" stopColor={GREEN_LIGHT} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M 0 90 C 60 60, 100 80, 160 50 S 280 30, 400 20 L 400 120 L 0 120 Z"
                    fill="url(#ch)"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  <motion.path
                    d="M 0 90 C 60 60, 100 80, 160 50 S 280 30, 400 20"
                    fill="none"
                    stroke={GREEN}
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1.2 }}
                  />
                </svg>
              </div>
              <div className="rounded-xl border border-black/5 bg-white p-3">
                <div className="mb-2 text-[11px] font-semibold text-neutral-700">
                  AI Analysis Summary
                </div>
                {[
                  ["Transcription Complete", "42", "bg-emerald-400"],
                  ["Insights Processing", "10", "bg-amber-400"],
                  ["Action Items Detected", "40", "bg-orange-400"],
                ].map(([l, v, c]) => (
                  <div key={l} className="mb-2 flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${c}`} />
                    <span className="flex-1 truncate text-[10px] text-neutral-600">
                      {l}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-700">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating play button */}
      <button
        className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white shadow-xl transition-transform hover:scale-110"
        style={{ background: GREEN }}
      >
        <Play className="h-5 w-5 translate-x-0.5 fill-white" />
      </button>
    </motion.div>
  );
}

function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={`rounded-md border px-2 py-1 text-[10px] ${
        active
          ? "border-transparent text-white"
          : "border-black/10 bg-white text-neutral-600"
      }`}
      style={active ? { background: GREEN } : undefined}
    >
      {children}
    </span>
  );
}

/* ----------------------------- LOGOS MARQUEE ----------------------------- */
function LogoMarquee() {
  const logos = [
    "ACME", "Typely", "Framex", "Webora", "Markivo",
    "Designo", "Nexora", "Lumio", "Northbase", "Quantra",
  ];
  return (
    <section className="py-16">
      <div className="mx-auto w-[min(1180px,92vw)] text-center">
        <p className="text-[13px] font-medium tracking-wide text-neutral-500">
          Trusted by more than 1,000+ teams
        </p>
      </div>
      <div className="relative mt-8 overflow-hidden">
        <div className="absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#f5efe5] to-transparent" />
        <div className="absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#f5efe5] to-transparent" />
        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        >
          {[...logos, ...logos, ...logos].map((name, i) => (
            <span
              key={i}
              className="text-[26px] font-semibold tracking-tight text-neutral-400/80"
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ----------------------------- FEATURES ----------------------------- */
function Features() {
  const items = [
    { icon: Mic, title: "Live Meeting Capture", desc: "Record meetings live or upload audio & video files instantly." },
    { icon: Wand2, title: "Smart AI Summaries", desc: "Generate detailed summaries automatically." },
    { icon: Sparkles, title: "Live Captions Highlighting", desc: "Highlight key moments and captions instantly." },
    { icon: Clock, title: "Smart Audio Timestamps", desc: "Jump directly to important moments inside any recording." },
    { icon: Languages, title: "Multi-Language Transcription", desc: "Transcribe meetings across multiple languages." },
    { icon: Download, title: "Meeting Export Options", desc: "Export notes, summaries, and actions in multiple formats." },
  ];
  return (
    <section className="relative py-24">
      <div className="mx-auto w-[min(1180px,92vw)]">
        <SectionLabel>Features</SectionLabel>
        <h2
          className="mx-auto mt-3 max-w-2xl text-center font-serif text-[clamp(36px,5vw,56px)] leading-[1.05] tracking-tight text-neutral-900"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Smart <em className="text-[--g]" style={{ ["--g" as any]: GREEN }}>features</em>
          <br /> for meetings
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-[15px] text-neutral-600">
          Automate recording, transcription, summaries, and actions for every
          meeting effortlessly.
        </p>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-6 transition-shadow hover:shadow-[0_20px_50px_-15px_rgba(15,90,63,0.15)]"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-50 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div
                  className="mb-4 grid h-11 w-11 place-items-center rounded-xl"
                  style={{ background: `${GREEN_LIGHT}22`, color: GREEN }}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="text-[16px] font-semibold text-neutral-900">
                  {f.title}
                </div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-neutral-600">
                  {f.desc}
                </p>
                <div className="mt-5 h-32 rounded-xl bg-gradient-to-br from-neutral-50 to-emerald-50/60" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center">
      <span
        className="inline-block rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: GREEN }}
      >
        {children}
      </span>
    </div>
  );
}

/* ----------------------------- AI TABS ----------------------------- */
function AISection() {
  const tabs = ["Capture", "Transcribe", "Extract", "Execute"];
  const [active, setActive] = useState(0);
  return (
    <section className="relative py-24" style={{ background: "#efe7d8" }}>
      <div className="mx-auto w-[min(1180px,92vw)]">
        <SectionLabel>Platform Core</SectionLabel>
        <h2
          className="mx-auto mt-3 max-w-3xl text-center font-serif text-[clamp(36px,5vw,56px)] leading-[1.05] tracking-tight text-neutral-900"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          AI that understands{" "}
          <em className="text-[--g]" style={{ ["--g" as any]: GREEN }}>meetings</em>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-[15px] text-neutral-600">
          Capture, understand, and transform meetings into structured,
          actionable intelligence automatically.
        </p>

        <div className="mx-auto mt-8 flex w-fit gap-1 rounded-full border border-black/10 bg-white/70 p-1 backdrop-blur">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setActive(i)}
              className="relative rounded-full px-5 py-2 text-[13px] font-medium transition-colors"
              style={{
                color: active === i ? "#fff" : "#374151",
              }}
            >
              {active === i && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: GREEN }}
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 grid items-center gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-white p-8">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Accurate AI
            </div>
            <div
              className="mt-2 font-serif text-[36px] leading-[1.1] text-neutral-900"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Transcription engine
            </div>
            <p className="mt-3 text-[14px] text-neutral-600">
              Convert speech into structured text automatically.
            </p>
            <div className="mt-5 space-y-2">
              {["Speaker identification", "Time-stamped text", "Editable transcripts"].map(
                (s) => (
                  <div key={s} className="flex items-center gap-2 text-[13.5px] text-neutral-700">
                    <Check className="h-4 w-4" style={{ color: GREEN }} /> {s}
                  </div>
                ),
              )}
            </div>
            <a
              href="#"
              className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium text-white"
              style={{ background: GREEN }}
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="relative aspect-square rounded-2xl border border-black/5 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
            {/* Faux transcript */}
            <div className="space-y-2.5">
              {[
                ["Sarah", "Let's review the Q3 roadmap before we ship.", true],
                ["Daniel", "I aligned with design on the onboarding flow.", false],
                ["Olivia", "Action: finalize pricing tiers by Friday.", true],
                ["Jason", "I'll own the comms plan for launch.", false],
              ].map(([name, msg, hl], i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`rounded-xl border px-3 py-2.5 ${
                    hl
                      ? "border-emerald-200 bg-emerald-50/80"
                      : "border-black/5 bg-white"
                  }`}
                >
                  <div className="mb-0.5 flex items-center gap-1.5 text-[10px] text-neutral-500">
                    <span className="font-semibold text-neutral-700">{name}</span>
                    <span>·</span>
                    <span>00:{(12 + i * 7).toString().padStart(2, "0")}</span>
                  </div>
                  <div className="text-[12.5px] text-neutral-800">{msg}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["4H+", "Per week saved"],
            ["1000+", "Meetings processed"],
            ["100%", "Meeting recorded"],
            ["60%", "Less manual notes"],
          ].map(([v, l]) => (
            <div
              key={l}
              className="rounded-2xl border border-black/5 bg-white/70 p-5 text-center backdrop-blur"
            >
              <div
                className="font-serif text-[40px] leading-none text-neutral-900"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {v}
              </div>
              <div className="mt-2 text-[12px] text-neutral-500">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- COMPARISON ----------------------------- */
function Comparison() {
  const rows = [
    ["Live Meeting Recording", "—", "Yes"],
    ["Audio & Video Upload", "—", "Yes"],
    ["Speaker Identification", "Manual", "Automatic"],
    ["AI-Generated Summaries", "—", "Yes"],
    ["Action Item Extraction", "Limited", "Yes"],
  ];
  return (
    <section className="py-24">
      <div className="mx-auto w-[min(1180px,92vw)]">
        <SectionLabel>Comparison</SectionLabel>
        <h2
          className="mx-auto mt-3 max-w-2xl text-center font-serif text-[clamp(36px,5vw,56px)] leading-[1.05] tracking-tight text-neutral-900"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Smarter than{" "}
          <em className="text-[--g]" style={{ ["--g" as any]: GREEN }}>other platforms</em>
        </h2>

        <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="grid grid-cols-3 border-b border-black/5 bg-neutral-50 text-[12px] font-semibold text-neutral-600">
            <div className="p-4">Features</div>
            <div className="p-4 text-center">Other platforms</div>
            <div
              className="flex items-center justify-center gap-1.5 p-4 text-center text-white"
              style={{ background: GREEN }}
            >
              <span className="grid h-4 w-4 place-items-center rounded bg-white/20 text-[9px]">
                N
              </span>
              notlex
            </div>
          </div>
          {rows.map(([feat, other, ours], i) => (
            <div
              key={feat}
              className={`grid grid-cols-3 text-[13.5px] ${
                i % 2 ? "bg-neutral-50/40" : ""
              }`}
            >
              <div className="p-4 text-neutral-800">{feat}</div>
              <div className="p-4 text-center text-neutral-400">{other}</div>
              <div className="flex items-center justify-center gap-1.5 p-4 text-center font-medium" style={{ color: GREEN }}>
                <Check className="h-4 w-4" /> {ours}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- TESTIMONIALS ----------------------------- */
function Testimonials() {
  const items = [
    { name: "Ryan Mitchell", role: "Creative Director at Typely", quote: "Typely uses Notlex to turn meetings into structured insights, helping teams align faster and reduce manual follow-ups." },
    { name: "Olivia Parker", role: "Head of Product, Framex", quote: "Notlex streamlined internal discussions and client calls into clear summaries, saving us hours every week." },
    { name: "Daniel Brooks", role: "UX Research Lead, Webora", quote: "We capture critical insights from interviews and transform conversations into actionable research notes." },
  ];
  return (
    <section className="py-24" style={{ background: "#efe7d8" }}>
      <div className="mx-auto w-[min(1180px,92vw)]">
        <SectionLabel>Stories</SectionLabel>
        <h2
          className="mx-auto mt-3 max-w-xl text-center font-serif text-[clamp(36px,5vw,52px)] leading-[1.05] tracking-tight text-neutral-900"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Loved by modern teams
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-2xl border border-black/5 bg-white p-6"
            >
              <Quote className="absolute right-5 top-5 h-5 w-5 text-neutral-200" />
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-neutral-700">
                "{t.quote}"
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-black/5 pt-4">
                <div
                  className="grid h-10 w-10 place-items-center rounded-full text-[12px] font-semibold text-white"
                  style={{ background: GREEN }}
                >
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-neutral-900">{t.name}</div>
                  <div className="text-[11px] text-neutral-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- CTA ----------------------------- */
function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto w-[min(1180px,92vw)]">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-16 text-center text-white"
          style={{ background: GREEN }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <svg viewBox="0 0 1200 400" className="h-full w-full" preserveAspectRatio="none">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.path
                  key={i}
                  d={`M -50 ${100 + i * 16} Q 280 ${100 + i * 16} 360 ${260 + i * 16} L 840 ${260 + i * 16} Q 920 ${100 + i * 16} 1250 ${100 + i * 16}`}
                  fill="none"
                  stroke={CREAM}
                  strokeWidth={2}
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, delay: i * 0.1 }}
                />
              ))}
            </svg>
          </div>
          <h2
            className="relative mx-auto max-w-2xl font-serif text-[clamp(36px,5vw,60px)] leading-[1.05]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Switch to notlex for smarter meeting notes
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-[15px] text-white/80">
            Trusted by 21K+ teams worldwide. Rated 5.0.
          </p>
          <div className="relative mt-8 flex items-center justify-center gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-neutral-900 transition-transform hover:scale-[1.03]"
              style={{ color: GREEN }}
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-[14px] font-medium text-white hover:bg-white/10"
            >
              Book a demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FOOTER ----------------------------- */
function Footer() {
  return (
    <footer className="border-t border-black/5 py-10">
      <div className="mx-auto flex w-[min(1180px,92vw)] flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div
            className="grid h-6 w-6 place-items-center rounded-md"
            style={{ background: GREEN }}
          >
            <span className="text-[11px] font-bold text-white">N</span>
          </div>
          <span className="text-[14px] font-semibold text-neutral-800">notlex</span>
        </div>
        <p className="text-[12px] text-neutral-500">
          Prototype clone of notlex.framer.website — isolated /lab page.
        </p>
        <div className="flex gap-5 text-[12px] text-neutral-500">
          <a href="#" className="hover:text-neutral-800">Privacy</a>
          <a href="#" className="hover:text-neutral-800">Terms</a>
          <a href="#" className="hover:text-neutral-800">Contact</a>
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------- ROOT ----------------------------- */
export default function NotlexPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: CREAM, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
      />
      <Nav />
      <Hero />
      <LogoMarquee />
      <Features />
      <AISection />
      <Comparison />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
