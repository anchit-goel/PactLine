"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  History,
  Bell,
  UserCircle,
  Terminal,
  Eye,
  LogOut,
  User,
  Settings as SettingsIcon,
  CheckCircle,
  Menu,
  FlaskConical,
  Sparkles,
} from "lucide-react";
import { useViewMode } from "./ViewModeContext";

export default function TopAppBar() {
  const { viewMode, setViewMode, isSidebarCollapsed, setIsSidebarCollapsed } = useViewMode();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 h-16 bg-white/95 backdrop-blur-md border-b border-[#E7E5E4] shadow-sm">
      {/* Logo & Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2 rounded-xl text-[#737373] hover:bg-[#F8F7F5] hover:text-[#171717] transition-colors cursor-pointer"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center gap-2.5 group" title="Return to Main Landing Page">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F07845] to-[#FF9060] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            P
          </div>
          <span className="text-xl font-black tracking-tight text-[#171717] uppercase select-none">
            Pactline
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF0E8] text-[#F07845]">
            Playground
          </span>
        </Link>
        <Link 
          href="/" 
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border border-[#E7E5E4] text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5] transition-colors"
        >
          Landing Page
        </Link>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-[#ECEAE5] border border-[#E7E5E4] rounded-full p-1 shadow-inner">
          <button
            onClick={() => setViewMode("developer")}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 ease-out active:scale-95 cursor-pointer ${
              viewMode === "developer"
                ? "bg-[#171717] text-white shadow-sm"
                : "text-[#737373] hover:text-[#171717]"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Developer
          </button>
          <button
            onClick={() => setViewMode("test")}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 ease-out active:scale-95 cursor-pointer ${
              viewMode === "test"
                ? "bg-[#171717] text-white shadow-sm"
                : "text-[#737373] hover:text-[#171717]"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Test
          </button>
          <button
            onClick={() => setViewMode("user")}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 ease-out active:scale-95 cursor-pointer ${
              viewMode === "user"
                ? "bg-[#171717] text-white shadow-sm"
                : "text-[#737373] hover:text-[#171717]"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            User
          </button>
        </div>

        {/* Search */}
        <div className="relative w-60 group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] w-4 h-4" />
          <input
            type="text"
            placeholder="Search canvas..."
            className="w-full bg-[#F8F7F5] border border-[#E7E5E4] text-[#171717] rounded-full pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#F07845] transition-all placeholder:text-[#A3A3A3]"
          />
        </div>

        {/* Icon Buttons */}
        <div className="flex items-center gap-2 border-l border-[#E7E5E4] pl-5">
          {/* History Dropdown */}
          <div className="relative" ref={historyRef}>
            <button 
              onClick={() => {
                setShowHistory(!showHistory);
                setShowNotifications(false);
                setShowProfile(false);
              }}
              title="Recent Activity"
              className={`w-9 h-9 flex items-center justify-center rounded-full border border-[#E7E5E4] transition-colors cursor-pointer shadow-sm ${
                showHistory ? "bg-[#171717] text-white" : "bg-white text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5]"
              }`}
            >
              <History className="w-4 h-4" />
            </button>
            
            {showHistory && (
              <div className="absolute right-0 mt-3 w-72 bg-white border border-[#E7E5E4] rounded-2xl shadow-xl py-2 z-[110] animate-in fade-in zoom-in duration-200 ease-out origin-top-right">
                <div className="px-4 py-2 border-b border-[#E7E5E4] mb-1">
                  <span className="font-bold text-[#171717] text-sm">Recent Activity</span>
                </div>
                <div className="max-h-[280px] overflow-y-auto">
                  <div className="px-4 py-2.5 hover:bg-[#F8F7F5] transition-colors cursor-pointer border-l-2 border-transparent hover:border-[#F07845]">
                    <p className="text-[13px] text-[#171717] font-semibold">Adult_Census_Audit.v1</p>
                    <p className="text-[11px] text-[#737373] mt-0.5">2 hours ago • Fairness Score: 84</p>
                  </div>
                  <div className="px-4 py-2.5 hover:bg-[#F8F7F5] transition-colors cursor-pointer border-l-2 border-transparent hover:border-[#F07845]">
                    <p className="text-[13px] text-[#171717] font-semibold">Loan_Approval_Pipeline</p>
                    <p className="text-[11px] text-[#737373] mt-0.5">Yesterday • Fairness Score: 91</p>
                  </div>
                  <div className="px-4 py-2.5 hover:bg-[#F8F7F5] transition-colors cursor-pointer border-l-2 border-transparent hover:border-[#F07845]">
                    <p className="text-[13px] text-[#171717] font-semibold">Creator_Sponsorship_Gate</p>
                    <p className="text-[11px] text-[#737373] mt-0.5">Oct 24, 2026 • Status: Approved</p>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-[#E7E5E4] mt-1 text-center">
                  <button className="text-[11px] text-[#737373] font-bold hover:text-[#171717] transition-colors uppercase tracking-wider cursor-pointer">
                    Clear History
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
                setShowHistory(false);
              }}
              title="Notifications"
              className={`w-9 h-9 flex items-center justify-center rounded-full border border-[#E7E5E4] transition-colors cursor-pointer shadow-sm relative ${
                showNotifications ? "bg-[#171717] text-white" : "bg-white text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5]"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F07845] rounded-full" />
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-[#E7E5E4] rounded-2xl shadow-xl py-2 z-[110] animate-in fade-in zoom-in duration-200 ease-out origin-top-right">
                <div className="px-4 py-2 border-b border-[#E7E5E4] flex justify-between items-center mb-1">
                  <span className="font-bold text-[#171717]">Notifications</span>
                  <span className="text-[10px] text-[#F07845] bg-[#FFF0E8] px-2 py-0.5 rounded-full font-bold">2 New</span>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-[#F8F7F5] transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E6F5ED] text-[#24966B] flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#171717] leading-tight">Fairness Audit Complete</p>
                        <p className="text-[11px] text-[#737373] mt-1">Adult_Dataset_Clean.csv processed successfully.</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 hover:bg-[#F8F7F5] transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFF0E8] text-[#F07845] flex items-center justify-center shrink-0">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#171717] leading-tight">Docker Sandbox Ready</p>
                        <p className="text-[11px] text-[#737373] mt-1">Docker environment active on port 8005.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
                setShowHistory(false);
              }}
              className="w-9 h-9 rounded-full bg-[#171717] text-white flex items-center justify-center text-xs font-bold shadow-sm cursor-pointer hover:bg-[#262626] transition-colors"
            >
              TP
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-[#E7E5E4] rounded-2xl shadow-xl py-2 z-[110] animate-in fade-in zoom-in duration-200 ease-out origin-top-right">
                <div className="px-4 py-3 border-b border-[#E7E5E4] mb-1">
                  <p className="text-sm font-bold text-[#171717]">Team TodPhod</p>
                  <p className="text-xs text-[#737373] truncate">Admin · Pactline</p>
                </div>
                <div className="px-2">
                  <Link href="/overview" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5] transition-all text-xs font-medium">
                    <User className="w-4 h-4" />
                    Overview
                  </Link>
                  <Link href="/deal/new" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5] transition-all text-xs font-medium">
                    <Sparkles className="w-4 h-4 text-[#F07845]" />
                    New Deal
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
