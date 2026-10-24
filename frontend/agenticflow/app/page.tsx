"use client";

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Shield, Cpu, Activity, BarChart3, Database, Lock, 
  FileSearch, Telescope, Waypoints, Network, Fingerprint, 
  CheckCircle2, AlertTriangle, Users, Scale, FileText, Terminal, 
  Search, Layers, Zap, Info, Radio
} from 'lucide-react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { InfiniteMarquee } from '@/components/InfiniteMarquee';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FaultyTerminal = dynamic(() => import('@/components/FaultyTerminal'), { ssr: false });
const BackgroundHalo = dynamic(() => import('@/components/BackgroundHalo').then(mod => mod.BackgroundHalo), { ssr: false });

export default function Landing() {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Hero Animation Timeline
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero-badge', { y: 30, opacity: 0, duration: 1, delay: 0.2 })
      .from('.hero-text-inner', { yPercent: 120, rotationZ: 2, duration: 1.2, stagger: 0.15 }, '-=0.8')
      .from('.hero-desc', { y: 30, opacity: 0, duration: 1 }, '-=0.8')
      .from('.hero-buttons', { y: 30, opacity: 0, duration: 1 }, '-=0.8')
      .from('.hero-stats', { y: 20, opacity: 0, duration: 1 }, '-=0.8');

    // Floating background shapes
    gsap.to('.floating-shape-1', {
      y: -100,
      rotation: 15,
      scrollTrigger: {
        trigger: container.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    });

    // 2. Metrics Section Parallax
    gsap.fromTo('.metric-card', 
      { y: 24 },
      {
        y: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.metrics-section',
          start: 'top 98%',
          once: true
        }
      }
    );

    // 3. Core Capabilities Stagger
    gsap.fromTo('.capability-card', 
      { y: 24 },
      {
        y: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.capabilities-section',
          start: 'top 98%',
          once: true
        }
      }
    );

    // 4. Pipeline Cards Reveal
    gsap.fromTo('.pipeline-card', 
      { y: 30 },
      {
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.pipelines-section',
          start: 'top 98%',
          once: true
        }
      }
    );

    // 5. Audience Cards Stagger
    gsap.fromTo('.audience-card', 
      { y: 24 },
      {
        y: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.audience-section',
          start: 'top 98%',
          once: true
        }
      }
    );

    // Ensure ScrollTrigger refreshes trigger offsets once layout settles
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);

    return () => clearTimeout(refreshTimer);
  }, { scope: container });

  const navItems = [
    { label: 'Workflows', path: '/dashboard' },
    { label: 'New Deal', path: '/deal/new' },
    { label: 'Overview', path: '/overview' },
    { label: 'Replay Demo', path: '/replay' },
    { label: 'About', path: '/about' },
  ];

  return (
    <div ref={container} className="flex-1 min-h-screen flex flex-col bg-[#F3F2EF] overflow-x-hidden relative text-[#171717] font-sans selection:bg-[#F07845] selection:text-white">
      <BackgroundHalo />
      
      {/* Background Terminal Effect - Preserved with cybernetic glowing matrix overlay */}
      <div className="fixed inset-0 z-0 opacity-[0.06] pointer-events-none">
        <FaultyTerminal
          scale={1}
          digitSize={1.5}
          scanlineIntensity={0.3}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          curvature={0.2}
          tint="#F07845"
          mouseReact
          mouseStrength={0.15}
          brightness={1}
          dpr={1}
        />
      </div>

      {/* Navigation Header */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[1240px] z-50 px-6 sm:px-8 py-3.5 flex items-center justify-between bg-white/90 backdrop-blur-md border border-[#E7E5E4] rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-10">
          <div 
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[#F07845] flex items-center justify-center text-white shadow-xs font-black text-sm tracking-tighter">
              P
            </div>
            <span className="text-sm font-display font-black text-[#171717] uppercase tracking-[0.25em]">
              PACTLINE
            </span>
          </div>

          <nav className="hidden md:flex gap-7 items-center">
            {navItems.map((item) => (
              <button 
                key={item.label} 
                onClick={() => router.push(item.path)}
                className="text-[11px] uppercase font-bold tracking-[0.15em] text-[#737373] hover:text-[#171717] transition-colors relative group py-1 cursor-pointer"
              >
                {item.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#F07845] transition-all group-hover:w-full"></span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Blinking Beacon */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-semibold tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            ONLINE • 13 ALGOS
          </div>

          <button 
            onClick={() => router.push('/dashboard')}
            className="group flex items-center gap-2.5 bg-[#171717] hover:bg-[#262626] text-white text-[11px] font-bold tracking-[0.15em] px-5 py-2.5 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            INITIALIZE AUDIT
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-32 relative z-10">
        
        {/* Hero Section */}
        <section className="px-6 lg:px-20 py-24 flex flex-col items-center text-center justify-center min-h-[90vh] relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#F07845]/10 rounded-full blur-[140px] pointer-events-none"></div>
          
          <div className="flex flex-col items-center gap-10 z-10 max-w-[1100px]">
            <div className="flex flex-col items-center gap-6">
              {/* Hero Badge with Blinking Light */}
              <span className="hero-badge inline-flex items-center gap-2.5 text-[11px] text-[#F07845] uppercase tracking-[0.25em] font-mono font-bold bg-white/90 backdrop-blur-md px-6 py-2 rounded-full border border-[#F07845]/30 shadow-[0_2px_15px_rgba(240,120,69,0.12)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F07845] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F07845]"></span>
                </span>
                Autonomous Fair Lending & Credit Risk Protocol
              </span>

              <h2 className="text-5xl md:text-7xl lg:text-[6.2rem] font-display font-black text-[#171717] uppercase tracking-tight leading-[0.95]">
                <div className="hero-title-line overflow-hidden"><div className="hero-text-inner">Your credit & risk AI is making</div></div> 
                <div className="hero-title-line overflow-hidden pb-3">
                  <div className="hero-text-inner text-transparent bg-clip-text bg-gradient-to-r from-[#F07845] via-[#EA580C] to-[#8B5CF6]">Biased Lending Decisions.</div>
                </div>
                <div className="hero-title-line overflow-hidden"><div className="hero-text-inner text-2xl md:text-4xl lg:text-5xl text-[#525252] font-extrabold normal-case tracking-normal">We prove disparate impact, calibrate credit models, and fix bias — autonomously.</div></div>
              </h2>
            </div>
            
            <p className="hero-desc text-base md:text-lg text-[#525252] leading-relaxed max-w-[760px] font-sans border-l-2 border-[#F07845] pl-6 text-left bg-white/60 backdrop-blur-xs p-4 rounded-r-2xl border-y-0 border-r-0 shadow-xs">
              Pactline deploys 13 scientific-grade detection algorithms to audit credit underwriting, loan approvals, and banking risk models. Detect disparate impact, eliminate demographic skew, and satisfy <strong className="text-[#171717] font-bold">ECOA, Fair Housing Act & Basel III</strong> regulatory compliance without retraining your models.
            </p>

            <div className="hero-buttons flex flex-col sm:flex-row gap-4 mt-2">
              <button 
                onClick={() => router.push('/deal/new')}
                className="group flex items-center justify-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-wider shadow-[0_8px_30px_rgba(240,120,69,0.3)] rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95 bg-[#F07845] hover:bg-[#EA580C] cursor-pointer text-white"
              >
                START FINANCIAL AUDIT PIPELINE
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => router.push('/replay')}
                className="group flex items-center justify-center gap-2.5 px-7 py-4 text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#F5F5F4] text-[#171717] border border-[#E7E5E4] rounded-full shadow-sm transition-all duration-300 ease-out hover:scale-105 active:scale-95 cursor-pointer"
              >
                DEMO REPLAY MODE
              </button>
            </div>

            <div className="hero-stats flex flex-wrap items-center gap-x-16 gap-y-8 mt-16 border-t border-[#E7E5E4] pt-12 w-full justify-center">
              {[
                { val: "13", label: "Fairness Algos" },
                { val: "02", label: "Audit Pipelines" },
                { val: "ECOA", label: "Compliance Ready" },
                { val: "0%", label: "Retraining Needed" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 group">
                  <span className="text-4xl md:text-6xl font-display font-black text-[#F07845] group-hover:scale-105 transition-transform duration-300">{stat.val}</span>
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-mono text-[#737373] font-bold group-hover:text-[#171717] transition-colors">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Infinite Marquee */}
        <InfiniteMarquee text="AUTONOMOUS CREDIT BIAS DETECTION • FAIR LENDING REGULATORY AUDITS • ECOA & CFPB COMPLIANCE VERIFIED • DISPARATE IMPACT REPAIR • CREDIT RISK CALIBRATION" />

        {/* Pipelines Side by Side */}
        <section className="pipelines-section px-6 lg:px-20 py-32 bg-[#F8F7F5] border-t border-[#E7E5E4] relative">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-20">
            <div className="flex flex-col gap-4 text-center items-center">
              <span className="text-[10px] text-[#F07845] uppercase tracking-[0.4em] font-mono font-bold bg-white px-4 py-1.5 rounded-full border border-[#E7E5E4] shadow-xs">
                The Two Modes
              </span>
              <h3 className="text-4xl lg:text-6xl font-display font-bold text-[#171717] uppercase tracking-tight">
                How it Works
              </h3>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* Dataset Pipeline */}
              <div className="pipeline-card p-8 sm:p-10 bg-white border border-[#E7E5E4] rounded-3xl relative overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.04)] group">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#F07845]"></div>
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-display font-black uppercase text-[#171717]">Dataset Pipeline</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F07845] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F07845]"></span>
                        </span>
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#F07845]">Port 8005 Active</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#F07845]/10 flex items-center justify-center text-[#F07845]">
                      <Database size={24} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-6 relative">
                    {[
                      { icon: <Search size={18} />, label: "Upload CSV", desc: "Ingest tabular data" },
                      { icon: <Telescope size={18} />, label: "Data Surveyor", desc: "Autonomous EDA & Profiling" },
                      { icon: <Scale size={18} />, label: "Fairness Adjudicator", desc: "Statistical Bias Detection" },
                      { icon: <Zap size={18} />, label: "Bias Mitigator", desc: "Pre-processing Correction" },
                      { icon: <CheckCircle2 size={18} />, label: "PDF Report + Fixed CSV", desc: "Compliant Output" },
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-4 group/step">
                        <div className="w-9 h-9 shrink-0 rounded-full bg-[#F3F2EF] border border-[#E7E5E4] flex items-center justify-center text-[#F07845] group-hover/step:bg-[#F07845] group-hover/step:text-white transition-all duration-300">
                          {step.icon}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">{step.label}</span>
                          <span className="text-xs text-[#737373]">{step.desc}</span>
                        </div>
                        {i < 4 && <div className="absolute left-[18px] top-9 w-[1px] h-6 bg-[#E7E5E4]"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Model Pipeline */}
              <div className="pipeline-card p-8 sm:p-10 bg-white border border-[#E7E5E4] rounded-3xl relative overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.04)] group">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#8B5CF6]"></div>
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-display font-black uppercase text-[#171717]">Model Pipeline</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5CF6]"></span>
                        </span>
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8B5CF6]">Port 8006 Active</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
                      <Cpu size={24} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 relative">
                    {[
                      { icon: <Layers size={18} />, label: "Upload PKL + Sample", desc: "Binary Classifier or Regressor" },
                      { icon: <Search size={18} />, label: "Model Inspector", desc: "Feature Importance & SHAP" },
                      { icon: <Activity size={18} />, label: "Behavioral Auditor", desc: "Subgroup Error Analysis" },
                      { icon: <Waypoints size={18} />, label: "Recalibrator", desc: "Threshold & Output Correction" },
                      { icon: <FileText size={18} />, label: "PDF Report + Map", desc: "Drop-in Correction Map" },
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-4 group/step">
                        <div className="w-9 h-9 shrink-0 rounded-full bg-[#F3F2EF] border border-[#E7E5E4] flex items-center justify-center text-[#8B5CF6] group-hover/step:bg-[#8B5CF6] group-hover/step:text-white transition-all duration-300">
                          {step.icon}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">{step.label}</span>
                          <span className="text-xs text-[#737373]">{step.desc}</span>
                        </div>
                        {i < 4 && <div className="absolute left-[18px] top-9 w-[1px] h-6 bg-[#E7E5E4]"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Actually Detect */}
        <section className="capabilities-section px-6 lg:px-20 py-32 bg-[#F3F2EF] border-t border-[#E7E5E4] relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-20">
            <div className="flex flex-col gap-4 text-center items-center">
              <span className="text-[10px] text-[#F07845] uppercase tracking-[0.4em] font-mono font-bold bg-white px-4 py-1.5 rounded-full border border-[#E7E5E4] shadow-xs">
                Detection Layers
              </span>
              <h3 className="text-4xl lg:text-6xl font-display font-bold text-[#171717] uppercase tracking-tight leading-none">
                What We Actually Detect
              </h3>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { title: "Direct Discrimination", desc: "Identified via counterfactual probing — would the decision change if only the protected attribute changed?", icon: <Search size={20} /> },
                { title: "Proxy Discrimination", desc: "Detecting covert proxies using SHAP attribution + Pearson r correlation analysis.", icon: <Network size={20} /> },
                { title: "Disparate Impact", desc: "Measuring selection rate gaps via DIR (Disparate Impact Ratio) and SPD.", icon: <Scale size={20} /> },
                { title: "Unequal Error Rates", desc: "Exposing bias in FPR (False Positives) and EOD (Equalized Odds Difference).", icon: <AlertTriangle size={20} /> },
                { title: "Intersectional Bias", desc: "Combinatorial scanning for gerrymandering across Race × Gender × Age intersections.", icon: <Layers size={20} /> },
              ].map((card, i) => (
                <div key={i} className="capability-card p-6 bg-white border border-[#E7E5E4] rounded-2xl flex flex-col gap-5 hover:border-[#F07845] hover:shadow-md transition-all shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#F07845]/10 text-[#F07845] flex items-center justify-center">
                    {card.icon}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h5 className="text-xs font-black uppercase tracking-wider text-[#171717] leading-tight">{card.title}</h5>
                    <p className="text-[11px] text-[#737373] leading-relaxed font-sans">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What You Get / Deliverables */}
        <section className="px-6 lg:px-20 py-32 bg-white border-t border-[#E7E5E4] relative">
          <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] text-[#F07845] uppercase tracking-[0.4em] font-mono font-bold bg-[#F3F2EF] px-4 py-1.5 rounded-full border border-[#E7E5E4] w-fit shadow-xs">
                  The Deliverables
                </span>
                <h3 className="text-4xl lg:text-6xl font-display font-bold text-[#171717] uppercase tracking-tight leading-tight">
                  Publication Ready <br /><span className="text-[#737373]">Audit Artifacts</span>
                </h3>
              </div>
              <p className="text-base text-[#525252] font-sans leading-relaxed">
                Pactline doesn&apos;t just show you charts. It produces the forensic evidence and drop-in fixes required for legal and engineering compliance.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Publication-ready PDF report",
                  "Compliance Verdict (EEOC/EU AI Act)",
                  "Post-Inference Correction Map",
                  "Fixed Dataset (Pre-processing)",
                  "Plain English Findings",
                  "Traceable Reasoning Logs"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F8F7F5] border border-[#E7E5E4]">
                    <CheckCircle2 size={16} className="text-[#F07845] shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              {/* PDF Container */}
              <div className="relative bg-[#FCFCFA] text-[#171717] rounded-xl p-8 shadow-2xl transition-all duration-500 group-hover:-translate-y-1 border border-[#D6D3D1] font-[family-name:var(--font-lora)]">
                
                {/* Academic Header */}
                <div className="flex flex-col items-center text-center border-b-2 border-black/80 pb-5 mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-black/50">Technical Report Series · Vol 42</span>
                    <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      CRYPTOGRAPHICALLY VERIFIED
                    </span>
                  </div>
                  <h4 className="text-xl font-bold leading-tight text-black">Pactline Protocol:<br/>Algorithmic Fairness Audit</h4>
                  <p className="text-[10px] italic mt-2 text-black/70">Generated autonomously via multi-agent adjudication</p>
                </div>

                <div className="flex flex-col gap-5 relative z-10">
                   {/* Abstract */}
                   <div>
                     <h5 className="text-[10px] font-sans font-bold uppercase tracking-widest text-black mb-1.5 border-b border-black/20 pb-0.5 inline-block">Executive Summary</h5>
                     <div className="text-[10px] text-justify leading-relaxed font-sans text-black/80 space-y-1.5">
                       <p>Analysis of 1,024,491 inference records completed.</p>
                       <p>Base rate disparity detected in Protected Attribute: Gender (DI = 0.72). Applied iterative reweighing (kamiran_calders_2012) to correct disparate impact.</p>
                       <p>Post-mitigation DI improved to 0.95. EEOC 4/5ths rule satisfied. Model artifacts compiled and cryptographically signed.</p>
                     </div>
                   </div>

                   {/* LaTeX Style Table */}
                   <div className="mt-1 text-[10px]">
                     <h5 className="text-[10px] font-sans font-bold uppercase tracking-widest text-black mb-2">Table 1. Disparate Impact (DI) Analysis</h5>
                     <div className="w-full border-t-[1.5px] border-b-[1.5px] border-black/80 py-1">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-black/20">
                              <th className="font-serif font-bold py-1 w-1/2">Protected Class</th>
                              <th className="font-serif font-bold py-1 text-right w-1/4">Pre-DI</th>
                              <th className="font-serif font-bold py-1 text-right w-1/4">Post-DI</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-1">Gender (Female)</td>
                              <td className="py-1 text-right text-red-600 font-semibold">0.72</td>
                              <td className="py-1 text-right font-bold text-emerald-700">0.95</td>
                            </tr>
                            <tr>
                              <td className="py-1">Age (&lt;25)</td>
                              <td className="py-1 text-right text-red-600 font-semibold">0.68</td>
                              <td className="py-1 text-right font-bold text-emerald-700">0.88</td>
                            </tr>
                            <tr>
                              <td className="py-1">Race (Non-White)</td>
                              <td className="py-1 text-right text-stone-700">0.85</td>
                              <td className="py-1 text-right font-bold text-emerald-700">0.91</td>
                            </tr>
                          </tbody>
                        </table>
                     </div>
                     <p className="text-[8px] italic mt-1.5 text-black/60">* Values &lt; 0.80 indicate potential disparate impact violation.</p>
                   </div>

                   {/* Math Equation Mock */}
                   <div className="py-2.5 px-3 bg-stone-100 rounded-sm flex items-center justify-center border border-stone-200">
                      <div className="font-[family-name:var(--font-lora)] text-[11px] text-center w-full flex items-center justify-center gap-2">
                        <span><span className="italic">DI</span> = </span>
                        <div className="flex flex-col items-center justify-center mx-1">
                          <span className="border-b border-black/80 px-2 pb-[1px]">Pr(<span className="italic">Y</span>=1 | <span className="italic">D</span>=unprivileged)</span>
                          <span className="pt-[1px] px-2">Pr(<span className="italic">Y</span>=1 | <span className="italic">D</span>=privileged)</span>
                        </div>
                        <span>&ge; 0.8</span>
                      </div>
                   </div>
                </div>

                {/* Academic Stamp */}
                <div className="absolute -bottom-4 -right-4 w-28 h-28 border-4 border-red-700/80 rounded-full flex items-center justify-center opacity-85 transform -rotate-12 pointer-events-none z-0">
                  <div className="w-24 h-24 border border-red-700/50 rounded-full flex items-center justify-center">
                     <div className="text-center">
                       <span className="block text-[8px] font-sans font-black text-red-700 tracking-[0.2em] uppercase">Audit</span>
                       <span className="block text-lg font-serif font-black text-red-700 leading-none">PASSED</span>
                       <span className="block text-[6px] font-mono text-red-700 mt-0.5">ISO/IEC 42001</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who it is for */}
        <section className="audience-section px-6 lg:px-20 py-32 bg-[#F8F7F5] border-t border-[#E7E5E4] relative">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-20">
            <div className="flex flex-col gap-4 text-center items-center">
              <span className="text-[10px] text-[#F07845] uppercase tracking-[0.4em] font-mono font-bold bg-white px-4 py-1.5 rounded-full border border-[#E7E5E4] shadow-xs">
                User Personas
              </span>
              <h3 className="text-4xl lg:text-6xl font-display font-bold text-[#171717] uppercase tracking-tight">Who it is For</h3>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
              {[
                { title: "Banks & Lenders", desc: "Institutions deploying AI for credit scoring, underwriting & mortgages.", icon: <Network size={22} /> },
                { title: "Risk & Compliance", desc: "Teams ensuring adherence to ECOA, Fair Housing Act & CFPB rules.", icon: <Shield size={22} /> },
                { title: "Credit Modelers", desc: "Risk quants needing drop-in threshold calibration without retraining.", icon: <Cpu size={22} /> },
                { title: "Regulators", desc: "Supervisory bodies auditing automated lending disparity & fair credit.", icon: <Scale size={22} /> },
                { title: "Fintechs", desc: "Fast-moving digital lenders requiring turn-key fair lending verification.", icon: <Zap size={22} /> },
              ].map((audience, i) => (
                <div key={i} className="audience-card p-6 bg-white border border-[#E7E5E4] rounded-3xl flex flex-col gap-5 group hover:border-[#F07845]/40 hover:shadow-md transition-all text-center items-center shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-[#F3F2EF] border border-[#E7E5E4] flex items-center justify-center text-[#737373] group-hover:text-[#F07845] group-hover:bg-[#F07845]/10 transition-colors">
                    {audience.icon}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h5 className="text-xs font-black uppercase tracking-wider text-[#171717]">{audience.title}</h5>
                    <p className="text-[11px] text-[#737373] leading-relaxed font-sans">{audience.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Honest Limitations Strip */}
        <div className="bg-amber-50/90 border-y border-amber-200 py-5 relative z-10">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-3 text-center">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <p className="text-[11px] uppercase font-bold tracking-[0.15em] text-amber-900 leading-relaxed">
              Platform Limitations: Supports tabular credit risk models, loan underwriting classifiers & regressors. Requires representative applicant sample data.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <section className="cta-section px-6 lg:px-20 py-36 flex flex-col items-center text-center gap-12 relative overflow-hidden bg-[#F3F2EF] border-t border-[#E7E5E4]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F07845]/10 rounded-full blur-[160px] pointer-events-none"></div>
          
          <div className="cta-content flex flex-col items-center gap-10 relative z-10">
            <div className="flex flex-col gap-5 items-center">
              <span className="text-[11px] text-[#F07845] uppercase tracking-[0.5em] font-mono font-bold bg-white px-5 py-2 rounded-full border border-[#E7E5E4] shadow-xs">
                Initialize Fair Lending Audit
              </span>
              <h3 className="text-6xl lg:text-7xl font-display font-black text-[#171717] uppercase tracking-tight leading-none">
                Audit Lending AI. <br />
                Ensure Compliance.
              </h3>
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="group flex items-center gap-4 px-12 py-5 text-sm font-bold uppercase tracking-wider rounded-full shadow-[0_8px_35px_rgba(240,120,69,0.35)] hover:scale-105 transition-all duration-300 ease-out active:scale-95 bg-[#F07845] hover:bg-[#EA580C] text-white cursor-pointer"
            >
              INITIALIZE FINANCIAL AUDIT
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </main>

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
              <button 
                key={item.label} 
                onClick={() => router.push(item.path)}
                className="text-[10px] uppercase tracking-widest text-[#737373] hover:text-[#171717] transition-colors font-bold cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
