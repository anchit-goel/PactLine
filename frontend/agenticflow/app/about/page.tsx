"use client";

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Shield, Cpu, Activity, BarChart3, Database, Lock, 
  FileSearch, Telescope, Waypoints, Network, Fingerprint, 
  CheckCircle2, AlertTriangle, Users, Scale, FileText, Terminal, 
  Search, Layers, Zap, Info, Binary, HelpCircle, ChevronDown, ChevronUp,
  Mail, ExternalLink
} from 'lucide-react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FaultyTerminal = dynamic(() => import('@/components/FaultyTerminal'), { ssr: false });
const BackgroundHalo = dynamic(() => import('@/components/BackgroundHalo').then(mod => mod.BackgroundHalo), { ssr: false });

export default function AboutPage() {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero-badge', { y: 30, opacity: 0, duration: 1, delay: 0.2 })
      .from('.hero-text-inner', { yPercent: 120, rotationZ: 2, duration: 1.2, stagger: 0.15 }, '-=0.8')
      .from('.hero-desc', { y: 30, opacity: 0, duration: 1 }, '-=0.8');
  }, { scope: container });

  const navItems = [
    { label: 'Workflows', path: '/dashboard' },
    { label: 'New Deal', path: '/deal/new' },
    { label: 'Overview', path: '/overview' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'About and FAQ', path: '/about' },
  ];

  const faqs = [
    {
      q: "What models does Pactline support?",
      a: "Pactline supports sklearn-compatible binary classifiers and regressors saved as .pkl or .joblib. This includes popular libraries like RandomForest, XGBoost, LightGBM, CatBoost, and standard Scikit-Learn linear/logistic models, including those wrapped in Pipelines."
    },
    {
      q: "Does it work without the training data?",
      a: "Yes for the model audit. You only need a representative sample of 200+ rows. Ground truth labels are optional—while more metrics are available when provided, the core behavioral audit can run without them using synthetic counterfactuals."
    },
    {
      q: "What does 'no retraining required' mean?",
      a: "Pactline addresses bias at the decision layer. For classifiers, we compute per-group decision thresholds that equalize fairness metrics. For regressors, we compute per-group output correction factors. Both are applied at inference time—your model file remains untouched."
    },
    {
      q: "Why can't it audit NLP or vision models?",
      a: "These models do not expose a standard tabular feature interface. Pactline's pipeline is optimized for tabular feature matrices. NLP and vision bias detection require fundamentally different techniques like embedding analysis or latent space probing."
    },
    {
      q: "What is the mathematical impossibility mentioned?",
      a: "According to the Kleinberg impossibility theorem, when group base rates differ, it is mathematically impossible to simultaneously equalize False Positive Rate, True Positive Rate, and Positive Predictive Value. Pactline detects this and helps you choose the most ethical tradeoff."
    },
    {
      q: "What compliance frameworks does it cover?",
      a: "Pactline targets the EEOC 4/5ths rule for employment, EU AI Act Article 10 for high-risk AI, ISO 24027 for bias taxonomy, ECOA for credit decisions, and the Equal Pay Act for compensation models."
    },
    {
      q: "Is the data ever sent anywhere?",
      a: "No. All processing happens inside an isolated Docker container on your own infrastructure. Your model files, sample data, and audit outputs never leave your environment."
    }
  ];

  return (
    <div ref={container} className="flex-1 min-h-screen flex flex-col bg-[#F3F2EF] overflow-x-hidden relative text-[#171717] font-sans selection:bg-[#F07845] selection:text-white">
      <BackgroundHalo />
      
      {/* Background Terminal Effect */}
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none">
        <FaultyTerminal scale={1} digitSize={1.5} scanlineIntensity={0.2} glitchAmount={0.5} flickerAmount={0.5} noiseAmp={1} curvature={0.2} tint="#F07845" brightness={1} dpr={1} />
      </div>

      {/* Navigation Header */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[1240px] z-50 px-6 sm:px-8 py-3.5 flex items-center justify-between bg-white/90 backdrop-blur-md border border-[#E7E5E4] rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-10">
          <div onClick={() => router.push('/')} className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-[#F07845] flex items-center justify-center text-white shadow-xs font-black text-sm tracking-tighter">P</div>
            <span className="text-sm font-display font-black text-[#171717] uppercase tracking-[0.25em]">Pactline</span>
          </div>
          <nav className="hidden md:flex gap-7 items-center">
            {navItems.map((item) => (
              <button 
                key={item.label} 
                onClick={() => router.push(item.path)}
                className={`text-[11px] uppercase font-bold tracking-[0.15em] transition-colors relative group py-1 cursor-pointer ${item.path === '/about' ? 'text-[#F07845]' : 'text-[#737373] hover:text-[#171717]'}`}
              >
                {item.label}
                <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#F07845] transition-all ${item.path === '/about' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="group flex items-center gap-2.5 bg-[#171717] hover:bg-[#262626] text-white text-[11px] font-bold tracking-[0.15em] px-5 py-2.5 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer">
            Initialize Audit
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-32 relative z-10">
        
        {/* About Hero */}
        <section className="px-6 lg:px-20 py-24 flex flex-col items-center text-center relative min-h-[45vh] justify-center">
          <div className="flex flex-col items-center gap-6 z-10 max-w-[900px]">
            <span className="hero-badge inline-flex items-center gap-2 text-[11px] text-[#F07845] uppercase tracking-[0.25em] font-mono font-bold bg-white/90 backdrop-blur-md px-6 py-2 rounded-full border border-[#F07845]/30 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F07845] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F07845]"></span>
              </span>
              Built for algorithmic fairness auditing
            </span>
            <h2 className="text-5xl md:text-7xl font-display font-black text-[#171717] uppercase tracking-tight leading-[0.95]">
              <div className="hero-title-line overflow-hidden"><div className="hero-text-inner">Ensuring Fairness</div></div> 
              <div className="hero-title-line overflow-hidden pb-2">
                <div className="hero-text-inner text-transparent bg-clip-text bg-gradient-to-r from-[#F07845] via-[#EA580C] to-[#8B5CF6]">In Every Decision.</div>
              </div>
            </h2>
            <p className="hero-desc text-base md:text-lg text-[#525252] leading-relaxed max-w-[760px] font-sans">
              Pactline is an advanced forensic framework developed by <strong className="text-[#171717] font-bold">Team TodPhod</strong> to detect and mitigate bias in automated decision systems.
            </p>
          </div>
        </section>

        {/* The Problem Statement */}
        <section className="px-6 lg:px-20 py-28 bg-white border-y border-[#E7E5E4]">
           <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-start">
             <div className="flex flex-col gap-6">
               <h3 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-wider text-[#171717]">The Problem</h3>
               <p className="text-base sm:text-lg text-[#171717] leading-relaxed font-sans italic border-l-4 border-[#F07845] pl-6 bg-[#F8F7F5] p-4 rounded-r-xl">
                 &quot;Unbiased AI Decision — Ensuring Fairness and Detecting Bias in Automated Decisions.&quot;
               </p>
               <p className="text-sm text-[#525252] font-sans leading-relaxed">
                 As AI takes over high-stakes domains like hiring, lending, and healthcare, biased decisions are becoming a systemic legal and ethical risk. Most existing tools are either too simple (basic stats) or too complex (requiring deep expertise). Pactline bridges this gap with autonomous, agentic auditing.
               </p>
             </div>
             
             <div className="flex flex-col gap-6">
               <h3 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-wider text-[#171717]">The Difference</h3>
               <div className="border border-[#E7E5E4] rounded-2xl overflow-hidden text-xs shadow-xs bg-white">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-[#F8F7F5] text-[#737373] uppercase font-bold tracking-wider">
                       <th className="p-3.5 border-b border-[#E7E5E4]">Feature</th>
                       <th className="p-3.5 border-b border-[#E7E5E4]">Competitors</th>
                       <th className="p-3.5 border-b border-[#E7E5E4] text-[#F07845]">Pactline</th>
                     </tr>
                   </thead>
                   <tbody className="text-[#525252] font-sans">
                     <tr className="border-b border-[#E7E5E4]">
                       <td className="p-3.5 font-bold text-[#171717]">Algorithm Delivery</td>
                       <td className="p-3.5">Hardcoded Libraries</td>
                       <td className="p-3.5 text-[#F07845] font-bold">Dynamic MCP Skills</td>
                     </tr>
                     <tr className="border-b border-[#E7E5E4]">
                       <td className="p-3.5 font-bold text-[#171717]">Bias Mitigation</td>
                       <td className="p-3.5">Retraining Required</td>
                       <td className="p-3.5 text-[#F07845] font-bold">Drop-in Threshold Maps</td>
                     </tr>
                     <tr className="border-b border-[#E7E5E4]">
                       <td className="p-3.5 font-bold text-[#171717]">Intersectional Scan</td>
                       <td className="p-3.5">Manual / Limited</td>
                       <td className="p-3.5 text-[#F07845] font-bold">Autonomous Combinatorial</td>
                     </tr>
                     <tr>
                       <td className="p-3.5 font-bold text-[#171717]">Target Audience</td>
                       <td className="p-3.5">Data Scientists Only</td>
                       <td className="p-3.5 text-[#F07845] font-bold">Compliance + Eng Teams</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
             </div>
           </div>
        </section>

        {/* Deep Dive into Modes */}
        <section className="px-6 lg:px-20 py-28 bg-[#F8F7F5] border-b border-[#E7E5E4]">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-20">
             <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="flex flex-col gap-5">
                  <span className="text-[10px] text-[#F07845] uppercase tracking-[0.4em] font-mono font-bold bg-white px-3 py-1 rounded-full border border-[#E7E5E4] w-fit shadow-xs">Mode 01</span>
                  <h3 className="text-3xl sm:text-4xl font-display font-black uppercase text-[#171717]">Dataset Mode</h3>
                  <p className="text-[#525252] leading-relaxed text-sm">
                    Used during the data preparation phase. Ingests raw CSV data and identifies inherent bias in features and historical outcomes. Produces a &quot;fixed&quot; version of your dataset using distribution alignment algorithms.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1.5 bg-white rounded-full border border-[#E7E5E4] text-[10px] uppercase font-bold text-[#171717]">CSV Input</span>
                    <span className="px-3 py-1.5 bg-white rounded-full border border-[#E7E5E4] text-[10px] uppercase font-bold text-[#171717]">Pre-processing</span>
                    <span className="px-3 py-1.5 bg-white rounded-full border border-[#E7E5E4] text-[10px] uppercase font-bold text-[#F07845]">DIR/SPD Algorithms</span>
                  </div>
                </div>
                <div className="aspect-video bg-white border border-[#E7E5E4] rounded-2xl p-8 flex items-center justify-center shadow-xs">
                   <Database size={80} className="text-[#F07845]/30" />
                </div>
             </div>

             <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="aspect-video bg-white border border-[#E7E5E4] rounded-2xl p-8 flex items-center justify-center lg:order-1 order-2 shadow-xs">
                   <Cpu size={80} className="text-[#8B5CF6]/30" />
                </div>
                <div className="flex flex-col gap-5 lg:order-2 order-1">
                  <span className="text-[10px] text-[#8B5CF6] uppercase tracking-[0.4em] font-mono font-bold bg-white px-3 py-1 rounded-full border border-[#E7E5E4] w-fit shadow-xs">Mode 02</span>
                  <h3 className="text-3xl sm:text-4xl font-display font-black uppercase text-[#171717]">Model Mode</h3>
                  <p className="text-[#525252] leading-relaxed text-sm">
                    Used for post-deployment verification. Ingests a saved model (.pkl) and a sample of inference data. Produces a threshold correction map that can be dropped into your existing inference service to equalize outcomes.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1.5 bg-white rounded-full border border-[#E7E5E4] text-[10px] uppercase font-bold text-[#171717]">PKL/Joblib Input</span>
                    <span className="px-3 py-1.5 bg-white rounded-full border border-[#E7E5E4] text-[10px] uppercase font-bold text-[#171717]">Post-inference</span>
                    <span className="px-3 py-1.5 bg-white rounded-full border border-[#E7E5E4] text-[10px] uppercase font-bold text-[#8B5CF6]">EOD/FPR Algorithms</span>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 lg:px-20 py-28 bg-[#F3F2EF]">
          <div className="max-w-[800px] mx-auto flex flex-col gap-16">
            <div className="text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E7E5E4] flex items-center justify-center text-[#F07845] shadow-xs">
                <HelpCircle size={24} />
              </div>
              <h3 className="text-3xl sm:text-5xl font-display font-black uppercase text-[#171717] tracking-tight">Frequently Asked</h3>
            </div>

            <div className="space-y-4">
               {faqs.map((faq, i) => (
                 <div key={i} className="border border-[#E7E5E4] rounded-2xl bg-white p-6 shadow-xs hover:border-[#F07845]/40 transition-colors">
                    <h4 className="text-base font-display font-bold uppercase text-[#171717] mb-2 flex items-center gap-3">
                      <span className="text-[#F07845] font-mono">Q.</span> {faq.q}
                    </h4>
                    <p className="text-sm text-[#525252] font-sans leading-relaxed pl-6">
                      {faq.a}
                    </p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* Platform Limitations */}
        <section className="px-6 lg:px-20 py-24 bg-white border-t border-[#E7E5E4]">
           <div className="max-w-[1200px] mx-auto p-10 sm:p-14 bg-amber-50/80 border border-amber-200 rounded-3xl flex flex-col gap-8 relative overflow-hidden">
             <div className="flex flex-col gap-3 relative z-10">
               <span className="text-xs text-amber-700 uppercase tracking-[0.3em] font-mono font-bold">Notice of Constraints</span>
               <h3 className="text-3xl sm:text-4xl font-display font-black uppercase text-amber-950 tracking-wider">Platform Limitations</h3>
             </div>
             <div className="grid md:grid-cols-2 gap-6 relative z-10">
               {[
                 "Supports binary and regression sklearn models only.",
                 "Requires minimum 200 rows of representative sample data.",
                 "Cannot audit NLP, Vision, Audio, or Multimodal models.",
                 "Cannot audit API-only models without model file access.",
                 "Calibration addresses decision layer only; not root cause.",
                 "Results are relative to the representativeness of provided sample."
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 items-start">
                   <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                   <p className="text-xs text-amber-900 font-sans leading-relaxed font-bold uppercase tracking-wider">{item}</p>
                 </div>
               ))}
             </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-14 border-t border-[#E7E5E4] bg-white relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-[1200px] mx-auto">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#F07845] flex items-center justify-center text-white text-xs font-black">P</div>
              <span className="font-display font-bold uppercase tracking-widest text-sm text-[#171717]">Pactline</span>
            </div>
            <span className="text-[11px] text-[#737373] uppercase tracking-wider font-semibold">© 2026 Pactline Forensic AI Systems</span>
            <span className="text-[9px] text-[#A8A29E] uppercase tracking-[0.3em] font-mono">Team TodPhod</span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4">
            {navItems.map((item) => (
              <button key={item.label} onClick={() => router.push(item.path)} className="text-[10px] uppercase tracking-widest text-[#737373] hover:text-[#171717] transition-colors font-bold cursor-pointer">
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
