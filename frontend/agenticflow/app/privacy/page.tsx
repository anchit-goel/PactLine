"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Lock, Database, Cpu, ArrowRight, CheckCircle2, 
  Server, Globe, CloudOff, Info, Search, ShieldAlert,
  Zap, Brain, Network, Terminal, Container, Trash2,
  LockIcon, EyeOff, FileText, Share2, Radio
} from 'lucide-react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FaultyTerminal = dynamic(() => import('@/components/FaultyTerminal'), { ssr: false });
const BackgroundHalo = dynamic(() => import('@/components/BackgroundHalo').then(mod => mod.BackgroundHalo), { ssr: false });

const DataSovereigntyVisualizer = () => {
  const [activeStep, setStep] = useState(0);

  const steps = [
    { 
      id: 'ingest',
      title: "Local Ingestion", 
      desc: "Files are copied into a local Docker container. No data leaves your machine.",
      icon: <Database size={22} />,
      status: "Local Environment"
    },
    { 
      id: 'process',
      title: "Agent Execution", 
      desc: "Four agents run inside the isolated sandbox, auditing your model and data.",
      icon: <Brain size={22} />,
      status: "Isolated Sandbox"
    },
    { 
      id: 'mcp',
      title: "Knowledge Injection", 
      desc: "Only Algorithm IDs are sent to MCP. In return, mathematical specs are received.",
      icon: <Radio size={22} />,
      status: "Secure Spec Exchange"
    },
    { 
      id: 'destroy',
      title: "Self-Destruction", 
      desc: "The container is wiped and destroyed. All temporary files are permanently erased.",
      icon: <Trash2 size={22} />,
      status: "Zero Persistence"
    }
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white border border-[#E7E5E4] rounded-3xl p-8 lg:p-14 relative overflow-hidden shadow-sm">
       <div className="flex flex-col gap-12 relative z-10">
          <div className="flex flex-col gap-3 text-center items-center">
             <span className="text-[10px] text-[#F07845] uppercase tracking-[0.4em] font-mono font-bold bg-[#F3F2EF] px-3.5 py-1.5 rounded-full border border-[#E7E5E4]">
               Privacy Flow Architecture
             </span>
             <h3 className="text-3xl lg:text-4xl font-display font-black uppercase text-[#171717] tracking-tight">
               The Isolation Lifecycle
             </h3>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-center">
             {/* Interaction Rail */}
             <div className="lg:col-span-5 flex flex-col gap-3">
                {steps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all text-left cursor-pointer ${activeStep === i ? 'bg-[#F07845]/10 border-[#F07845]/40 shadow-xs' : 'bg-[#F8F7F5] border-[#E7E5E4] hover:bg-white'}`}
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${activeStep === i ? 'bg-[#F07845] text-white' : 'bg-white border border-[#E7E5E4] text-[#737373]'}`}>
                       {step.icon}
                    </div>
                    <div className="flex flex-col gap-0.5">
                       <span className="text-xs font-black uppercase tracking-wider text-[#171717]">{step.title}</span>
                       <span className="text-[11px] text-[#737373] leading-relaxed font-sans">{step.desc}</span>
                    </div>
                  </button>
                ))}
             </div>

             {/* Visual Stage */}
             <div className="lg:col-span-7 aspect-square lg:aspect-video bg-[#F3F2EF] rounded-2xl border border-[#E7E5E4] relative flex items-center justify-center overflow-hidden">
                <div className="relative z-10 w-full h-full p-8 flex items-center justify-center">
                   
                   {/* Step 0: Ingest */}
                   {activeStep === 0 && (
                     <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-4">
                           <FileText size={40} className="text-[#A8A29E]" />
                           <ArrowRight size={36} className="text-[#F07845] animate-pulse" />
                           <div className="w-20 h-20 rounded-2xl bg-[#F07845]/10 border-2 border-[#F07845] border-dashed flex items-center justify-center">
                              <Container size={36} className="text-[#F07845]" />
                           </div>
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#F07845] font-bold">Inbound Data &rarr; Local Container</span>
                     </div>
                   )}

                   {/* Step 1: Process */}
                   {activeStep === 1 && (
                     <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-44 h-44 rounded-full border border-[#F07845]/30 flex items-center justify-center relative bg-white">
                           <div className="absolute inset-0 border-2 border-[#F07845] border-dashed rounded-full animate-spin-slow"></div>
                           <Brain size={56} className="text-[#F07845] animate-pulse" />
                           {[0, 90, 180, 270].map(deg => (
                             <div key={deg} className="absolute w-7 h-7 rounded-lg bg-white border border-[#E7E5E4] flex items-center justify-center text-[#737373] shadow-xs" style={{ transform: `rotate(${deg}deg) translateX(70px) rotate(-${deg}deg)` }}>
                               <Cpu size={14} />
                             </div>
                           ))}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#F07845] font-bold">4 Autonomous Agents In Docker</span>
                     </div>
                   )}

                   {/* Step 2: MCP */}
                   {activeStep === 2 && (
                     <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500 w-full px-8">
                        <div className="flex justify-between items-center w-full">
                           <div className="flex flex-col items-center gap-2">
                              <Container size={36} className="text-[#F07845]" />
                              <span className="text-[9px] font-mono uppercase text-[#737373] tracking-wider font-bold">Local Sandbox</span>
                           </div>
                           
                           <div className="flex-1 flex flex-col gap-3 px-6 relative">
                              <div className="flex items-center justify-center gap-2">
                                 <div className="h-[1px] flex-1 bg-gradient-to-r from-[#F07845] to-transparent"></div>
                                 <span className="text-[9px] font-mono text-[#F07845] uppercase font-bold">req: algo_id_04</span>
                                 <div className="h-[1px] flex-1 bg-gradient-to-l from-[#F07845] to-transparent"></div>
                              </div>
                              <div className="flex items-center justify-center gap-2">
                                 <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
                                 <span className="text-[9px] font-mono text-blue-600 uppercase font-bold">res: math_spec.md</span>
                                 <div className="h-[1px] flex-1 bg-gradient-to-l from-blue-500 to-transparent"></div>
                              </div>
                           </div>

                           <div className="flex flex-col items-center gap-2">
                              <Server size={36} className="text-blue-600" />
                              <span className="text-[9px] font-mono uppercase text-[#737373] tracking-wider font-bold">Auditor MCP</span>
                           </div>
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] font-bold">Zero User Data Crosses The Boundary</span>
                     </div>
                   )}

                   {/* Step 3: Destroy */}
                   {activeStep === 3 && (
                     <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 rounded-2xl bg-red-50 border-2 border-red-300 border-dashed flex items-center justify-center text-red-600">
                           <Trash2 size={40} className="animate-bounce" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-600 font-bold">Ephemeral Container Erased & Cleaned</span>
                     </div>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default function PrivacyPage() {
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

  return (
    <div ref={container} className="flex-1 min-h-screen flex flex-col bg-[#F3F2EF] overflow-x-hidden relative text-[#171717] font-sans selection:bg-[#F07845] selection:text-white">
      <BackgroundHalo />
      
      {/* Background Terminal Effect */}
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none">
        <FaultyTerminal scale={1} digitSize={1.5} scanlineIntensity={0.2} glitchAmount={0.5} flickerAmount={0.5} noiseAmp={1} curvature={0.2} tint="#F07845" brightness={1} dpr={1} />
      </div>

      {/* Navigation Header */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[1240px] z-[100] px-6 sm:px-8 py-3.5 flex items-center justify-between bg-white/90 backdrop-blur-md border border-[#E7E5E4] rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.06)]">
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
                className={`text-[11px] uppercase font-bold tracking-[0.15em] transition-colors relative group py-1 cursor-pointer ${item.path === '/privacy' ? 'text-[#F07845]' : 'text-[#737373] hover:text-[#171717]'}`}
              >
                {item.label}
                <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#F07845] transition-all ${item.path === '/privacy' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
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

      <main className="flex-1 flex flex-col pt-32 relative z-20">
        
        {/* Privacy Hero */}
        <section className="px-6 lg:px-20 py-24 flex flex-col items-center text-center relative min-h-[45vh] justify-center">
          <div className="flex flex-col items-center gap-6 z-10 max-w-[1000px]">
            <span className="hero-badge inline-flex items-center gap-2 text-[11px] text-[#F07845] uppercase tracking-[0.25em] font-mono font-bold bg-white/90 backdrop-blur-md px-6 py-2 rounded-full border border-[#F07845]/30 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F07845] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F07845]"></span>
              </span>
              Data Sovereignty Protocol
            </span>
            <h2 className="text-4xl md:text-7xl font-display font-black text-[#171717] uppercase tracking-tight leading-[0.95]">
              <div className="hero-title-line overflow-hidden"><div className="hero-text-inner text-[#171717]">Your Data Never Reaches Us.</div></div> 
              <div className="hero-title-line overflow-hidden pb-2">
                <div className="hero-text-inner text-transparent bg-clip-text bg-gradient-to-r from-[#F07845] via-[#EA580C] to-[#8B5CF6]">By Architecture.</div>
              </div>
            </h2>
            <p className="hero-desc text-base md:text-lg text-[#525252] leading-relaxed max-w-[820px] font-sans">
              Pactline is built on a &quot;local-first&quot; security model. Unlike traditional SaaS tools that ingest your dataset into their cloud, Pactline creates an isolated, ephemeral sandbox on your infrastructure. Your files stay with you; our mathematical expertise comes to you.
            </p>
          </div>
        </section>

        {/* Interactive Visualizer */}
        <section className="px-6 lg:px-20 py-16 bg-[#F3F2EF] relative z-10">
           <DataSovereigntyVisualizer />
        </section>

        {/* Technical Deep Dive */}
        <section className="px-6 lg:px-20 py-28 bg-white border-y border-[#E7E5E4]">
           <div className="max-w-[1200px] mx-auto flex flex-col gap-20">
              <div className="grid lg:grid-cols-2 gap-16">
                 <div className="flex flex-col gap-6">
                    <h3 className="text-2xl sm:text-3xl font-display font-black uppercase text-[#171717] tracking-wider">The Local Isolation Protocol</h3>
                    <div className="space-y-4">
                       {[
                         { title: "Isolated Containerization", desc: "Your files are copied into an isolated Docker container running on your machine or server. Nothing is sent to our servers." },
                         { title: "Sandbox Execution", desc: "All four AI agents run inside this container. Your dataset, model file, and sample data never leave the Docker boundary." },
                         { title: "Total Erasure", desc: "When the audit completes, the container stops and is destroyed. All internal data is wiped. Only your local output folder persists." },
                         { title: "Skill-Based Guaranteed", desc: "If using the Claude Code skill, the same guarantee applies. Processing happens locally; we provide the knowledge, you provide the infrastructure." }
                       ].map((item, i) => (
                         <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#F8F7F5] border border-[#E7E5E4]">
                            <div className="w-2 h-2 rounded-full bg-[#F07845] mt-1.5 shrink-0"></div>
                            <div className="flex flex-col gap-0.5">
                               <span className="text-xs font-black uppercase text-[#171717] tracking-wider">{item.title}</span>
                               <span className="text-xs text-[#525252] leading-relaxed font-sans">{item.desc}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="flex flex-col gap-8">
                    <div className="p-7 bg-[#F8F7F5] border border-[#E7E5E4] rounded-2xl flex flex-col gap-4 relative overflow-hidden">
                       <h4 className="text-lg font-display font-black uppercase text-[#171717]">What the MCP Server receives</h4>
                       <p className="text-xs text-[#525252] leading-relaxed font-sans">
                         When an agent queries the MCP server, it sends only a specific <strong>Algorithm ID</strong>. In return, it receives a <strong>Mathematical Specification Document</strong>.
                       </p>
                       <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 flex items-center gap-3">
                          <EyeOff size={18} className="text-red-600 shrink-0" />
                          <span className="text-[10px] font-mono uppercase text-red-700 font-bold tracking-wider">Your data, model, and predictions NEVER touch the MCP server.</span>
                       </div>
                    </div>

                    <div className="p-7 bg-[#F07845]/5 border border-[#F07845]/20 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
                       <h4 className="text-lg font-display font-black uppercase text-[#171717]">For Maximum Sovereignty</h4>
                       <p className="text-xs text-[#525252] leading-relaxed font-sans">
                         If you need complete air-gap isolation, you can <strong>Self-Host the MCP server</strong>. The full server code is open-source. Run it locally and the entire pipeline operates with <strong>Zero External Network Calls</strong>.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Compliance Section */}
        <section className="px-6 lg:px-20 py-24 bg-[#F3F2EF]">
           <div className="max-w-[1000px] mx-auto p-10 bg-white border border-[#E7E5E4] rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-xs">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                 <ShieldCheckIcon size={32} />
              </div>
              <div className="flex flex-col gap-2 text-center md:text-left">
                 <h3 className="text-2xl font-display font-black uppercase text-[#171717] tracking-wider">GDPR-Compatible By Design</h3>
                 <p className="text-xs text-[#525252] leading-relaxed font-sans">
                   Pactline&apos;s architecture is natively compliant with the highest global privacy standards. No personal data is processed on external servers. No data retention. No persistent logs of your data on our side. You maintain 100% control over your data lifecycle.
                 </p>
              </div>
           </div>
        </section>
      </main>

      <footer className="px-6 py-14 border-t border-[#E7E5E4] bg-white relative z-40">
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

const ShieldCheckIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);
