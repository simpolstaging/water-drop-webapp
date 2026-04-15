import { useState } from "react";
import { Toaster } from "sonner";
import { TestTab } from "./components/TestTab";
import { ShowTab } from "./components/ShowTab";
import { API_BASE_URL } from "./config";
import { api } from "./api";
import { ConnectionStatus } from "./components/ConnectionStatus";

type Tab = "test" | "show";

const TABS: { id: Tab; label: string }[] = [
  { id: "test", label: "Test" },
  { id: "show", label: "Show" },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("test");

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0d1117]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <span className="text-sky-400 text-lg">&#9684;</span>
            <span className="font-semibold text-slate-100 tracking-tight text-base">
              WaterDrop
            </span>
            <span className="text-xs text-slate-600 font-mono hidden md:block">
              {API_BASE_URL}
            </span>
          </div>
          <ConnectionStatus />
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-slate-800 bg-[#0d1117]">
        <div className="max-w-2xl mx-auto px-4 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); api.setMode(tab.id); }}
              className={`
                px-5 py-3.5 text-sm font-medium tracking-wide
                border-b-2 transition-colors duration-100
                focus-visible:outline-none
                ${
                  activeTab === tab.id
                    ? "border-sky-500 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto">
        {activeTab === "test" && <TestTab />}
        {activeTab === "show" && <ShowTab />}
      </main>

      {/* Toast container */}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#1e2533",
            border: "1px solid #2d3748",
            color: "#e2e8f0",
          },
        }}
      />
    </div>
  );
}

export default App;
