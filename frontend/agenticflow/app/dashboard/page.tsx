"use client";

import TopAppBar from "@/components/TopAppBar";
import SideNavBar from "@/components/SideNavBar";
import FlowCanvas from "@/components/FlowCanvas";
import AlgorithmLibrary from "@/components/AlgorithmLibrary";
import TourWindow from "@/components/TourWindow";
import { ViewModeProvider, useViewMode } from "@/components/ViewModeContext";

function HomeContent() {
  const { showTour, setShowTour, currentView } = useViewMode();

  return (
    <div className="interior-theme min-h-screen bg-[#F3F2EF] text-[#171717]">
      <TopAppBar />
      <SideNavBar />
      {currentView === "dataset" && <FlowCanvas />}
      {currentView === "library" && <AlgorithmLibrary />}
      {showTour && <TourWindow onClose={() => setShowTour(false)} />}
    </div>
  );
}

export default function Home() {
  return (
    <ViewModeProvider>
      <HomeContent />
    </ViewModeProvider>
  );
}
