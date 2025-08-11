import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Journal from "@/pages/journal";
import Report from "@/pages/report";
import BottomNavigation from "@/components/bottom-navigation";

function Router() {
  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative pb-20">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/journal" component={Journal} />
        <Route path="/report" component={Report} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
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
