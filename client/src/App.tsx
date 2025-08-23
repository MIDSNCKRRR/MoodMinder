import { Switch, Route } from "wouter";
import { useRef } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Journal from "@/pages/journal";
import Report from "@/pages/report";
import CrisisSupport from "@/pages/crisis-support";
import BottomNavigation from "@/components/bottom-navigation";

function Router() {
  const journalResetRef = useRef<(() => void) | null>(null);

  return (
    <div className="max-w-sm mx-auto min-h-screen relative pb-20 shadow-lg" style={{ background: 'var(--app-container-bg)' }}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/journal" component={() => <Journal onResetRef={journalResetRef} />} />
        <Route path="/insights" component={Report} />
        <Route path="/crisis-support" component={CrisisSupport} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation onJournalClick={() => journalResetRef.current?.()} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="bg-stone-50 font-sans min-h-screen">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
