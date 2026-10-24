# EDITS.md - Log of Minimal Edits

This file logs all edits made to files retained in the repository during refactoring to the `strip/pactline-base` branch.

---

### 1. `.dockerignore`
- **Purpose**: Ignore archived directory during Docker builds without affecting git tracking.
- **Before**:
```dockerignore
outputs
dataset/data.csv
*.pyc
.gemini
```
- **After**:
```dockerignore
outputs
dataset/data.csv
*.pyc
.gemini
_archive/
```

---

### 2. `frontend/agenticflow/app/dashboard/page.tsx`
- **Purpose**: Remove imports and rendering blocks for archived `ModelFlowCanvas` and `BiasProbePanel` views.
- **Before**:
```tsx
import TopAppBar from "@/components/TopAppBar";
import SideNavBar from "@/components/SideNavBar";
import FlowCanvas from "@/components/FlowCanvas";
import ModelFlowCanvas from "@/components/ModelFlowCanvas";
import BiasProbePanel from "@/components/BiasProbePanel";
import AlgorithmLibrary from "@/components/AlgorithmLibrary";
import TourWindow from "@/components/TourWindow";
import { ViewModeProvider, useViewMode } from "@/components/ViewModeContext";

function HomeContent() {
  const { showTour, setShowTour, currentView } = useViewMode();

  return (
    <>
      <TopAppBar />
      <SideNavBar />
      {currentView === "dataset" && <FlowCanvas />}
      {currentView === "model" && <ModelFlowCanvas />}
      {currentView === "biasprobe" && <BiasProbePanel />}
      {currentView === "library" && <AlgorithmLibrary />}
      {showTour && <TourWindow onClose={() => setShowTour(false)} />}
    </>
  );
}
```
- **After**:
```tsx
import TopAppBar from "@/components/TopAppBar";
import SideNavBar from "@/components/SideNavBar";
import FlowCanvas from "@/components/FlowCanvas";
import AlgorithmLibrary from "@/components/AlgorithmLibrary";
import TourWindow from "@/components/TourWindow";
import { ViewModeProvider, useViewMode } from "@/components/ViewModeContext";

function HomeContent() {
  const { showTour, setShowTour, currentView } = useViewMode();

  return (
    <>
      <TopAppBar />
      <SideNavBar />
      {currentView === "dataset" && <FlowCanvas />}
      {currentView === "library" && <AlgorithmLibrary />}
      {showTour && <TourWindow onClose={() => setShowTour(false)} />}
    </>
  );
}
```

---

### 3. `frontend/agenticflow/components/SideNavBar.tsx`
- **Purpose**: Remove navigation buttons for `model` and `biasprobe` modes.
- **Before**:
```tsx
        <button
          onClick={() => setCurrentView("model")}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] cursor-pointer ${
            currentView === "model"
              ? "bg-secondary/10 text-secondary border-r-4 border-secondary shadow-[inset_1px_0_0_0_rgba(100,200,255,0.3)]"
              : "text-gray-500 hover:text-gray-200 hover:bg-surface-container"
          }`}
        >
          <Fingerprint className={`w-5 h-5 ${currentView === "model" ? "text-secondary" : "text-gray-500"}`} />
          <span className="font-bold tracking-tight">Model Auditor</span>
        </button>

        <button
          onClick={() => setCurrentView("library")}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] cursor-pointer ${
            currentView === "library"
              ? "bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500 shadow-[inset_1px_0_0_0_rgba(16,185,129,0.3)]"
              : "text-gray-500 hover:text-gray-200 hover:bg-surface-container"
          }`}
        >
          <Library className={`w-5 h-5 ${currentView === "library" ? "text-emerald-400" : "text-gray-500"}`} />
          <span className="font-bold tracking-tight">Algorithm Library</span>
        </button>

        <button
          onClick={() => setCurrentView("biasprobe")}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] cursor-pointer ${
            currentView === "biasprobe"
              ? "bg-amber-500/10 text-amber-400 border-r-4 border-amber-500 shadow-[inset_1px_0_0_0_rgba(245,158,11,0.3)]"
              : "text-gray-500 hover:text-gray-200 hover:bg-surface-container"
          }`}
        >
          <FlaskConical className={`w-5 h-5 ${currentView === "biasprobe" ? "text-amber-400" : "text-gray-500"}`} />
          <span className="font-bold tracking-tight">LLM BiasProbe</span>
        </button>
```
- **After**:
```tsx
        <button
          onClick={() => setCurrentView("library")}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] cursor-pointer ${
            currentView === "library"
              ? "bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500 shadow-[inset_1px_0_0_0_rgba(16,185,129,0.3)]"
              : "text-gray-500 hover:text-gray-200 hover:bg-surface-container"
          }`}
        >
          <Library className={`w-5 h-5 ${currentView === "library" ? "text-emerald-400" : "text-gray-500"}`} />
          <span className="font-bold tracking-tight">Algorithm Library</span>
        </button>
```

---

### 4. `frontend/agenticflow/components/ViewModeContext.tsx`
- **Purpose**: Restrict `CurrentView` union to retained views.
- **Before**:
```tsx
export type CurrentView = "dataset" | "model" | "biasprobe" | "library";
```
- **After**:
```tsx
export type CurrentView = "dataset" | "library";
```

---

### 5. `frontend/agenticflow/app/page.tsx`
- **Purpose**: Remove landing page links and CTA button for archived `/science` and `/claude-skill` pages.
- **Before**:
```tsx
  const navItems = [
    { label: 'Science', path: '/science' },
    { label: 'Agent Plugin', path: '/claude-skill' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'About and FAQ', path: '/about' },
  ];
...
              <button 
                onClick={() => router.push('/science')}
                className="flex items-center justify-center gap-3 text-[10px] uppercase font-bold tracking-[0.3em] text-on-surface-variant hover:text-on-surface px-12 border border-outline-variant/30 rounded-full py-6 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:scale-105 transition-all duration-300 ease-out active:scale-95"
              >
                EXPLORE THE SCIENCE
              </button>
```
- **After**:
```tsx
  const navItems = [
    { label: 'Privacy', path: '/privacy' },
    { label: 'About and FAQ', path: '/about' },
  ];
```

---

### 6. `frontend/agenticflow/app/about/page.tsx`
- **Purpose**: Remove `/science` and `/claude-skill` from navigation header.
- **Before**:
```tsx
  const navItems = [
    { label: 'Science', path: '/science' },
    { label: 'Agent Plugin', path: '/claude-skill' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'About and FAQ', path: '/about' },
  ];
```
- **After**:
```tsx
  const navItems = [
    { label: 'Privacy', path: '/privacy' },
    { label: 'About and FAQ', path: '/about' },
  ];
```

---

### 7. `frontend/agenticflow/app/privacy/page.tsx`
- **Purpose**: Remove `/science` and `/claude-skill` from navigation header.
- **Before**:
```tsx
  const navItems = [
    { label: 'Science', path: '/science' },
    { label: 'Agent Plugin', path: '/claude-skill' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'About and FAQ', path: '/about' },
  ];
```
- **After**:
```tsx
  const navItems = [
    { label: 'Privacy', path: '/privacy' },
    { label: 'About and FAQ', path: '/about' },
  ];
```

---

### 8. `frontend/agenticflow/components/AskSidebar.tsx`
- **Purpose**: Remove archived `model` mode checks (`currentView === "model"`) from fallback names and API base URL resolution to fix TypeScript compilation error TS2367.
- **Before**:
```tsx
const FALLBACK_NAMES = currentView === "model" ? MODEL_FALLBACK_NAMES : DATA_FALLBACK_NAMES;
...
const baseUrl = currentView === "model" ? MODEL_API_BASE_URL : API_BASE_URL;
```
- **After**:
```tsx
const FALLBACK_NAMES = DATA_FALLBACK_NAMES;
...
const baseUrl = API_BASE_URL;
```
