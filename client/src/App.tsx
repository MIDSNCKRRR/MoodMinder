import { Switch, Route, useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuthContext } from "@/components/auth/auth-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Journal from "@/pages/journal";
import Report from "@/pages/report";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import AuthError from "@/pages/auth-error";
import PasswordResetRequest from "@/pages/password-reset-request";
import PasswordResetConfirm from "@/pages/password-reset-confirm";
import EmailUnverified from "@/pages/email-unverified";
import AccountLocked from "@/pages/account-locked";
import SessionExpired from "@/pages/session-expired";
import Support from "@/pages/support";
import LegalTerms from "@/pages/legal-terms";
import LegalPrivacy from "@/pages/legal-privacy";
import CrisisSupport from "@/pages/crisis-support";
import BottomNavigation from "@/components/bottom-navigation";
import { UserMenu } from "@/components/auth/user-menu";
import Account from "@/pages/account";

const PUBLIC_ROUTE_SET = new Set([
  "/login",
  "/signup",
  "/auth/error",
  "/password-reset",
  "/password-reset/confirm",
  "/auth/email-unverified",
  "/auth/account-locked",
  "/auth/session-expired",
  "/support",
  "/legal/terms",
  "/legal/privacy",
]);

const AUTH_ONLY_REDIRECT_SET = new Set([
  "/login",
  "/signup",
  "/password-reset",
  "/password-reset/confirm",
]);

const HIDE_BOTTOM_NAV_SET = new Set([
  "/login",
  "/signup",
  "/auth/error",
  "/password-reset",
  "/password-reset/confirm",
  "/auth/email-unverified",
  "/auth/account-locked",
  "/auth/session-expired",
  "/support",
  "/legal/terms",
  "/legal/privacy",
]);

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center text-stone-400">
      <span className="animate-pulse">Loading...</span>
    </div>
  );
}

function Router() {
  const journalResetRef = useRef<(() => void) | null>(null);
  const [location, navigate] = useLocation();
  const { user, isLoading } = useAuthContext();
  const currentPath = location.split("?")[0];
  const isPublicRoute = PUBLIC_ROUTE_SET.has(currentPath);
  const hideBottomNavigation = HIDE_BOTTOM_NAV_SET.has(currentPath);

  useEffect(() => {
    if (isLoading) return;
    if (!user && !isPublicRoute) {
      navigate("/login", { replace: true });
    } else if (user && AUTH_ONLY_REDIRECT_SET.has(currentPath)) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, isPublicRoute, currentPath, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user && !isPublicRoute) {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen relative pb-20 shadow-lg" style={{ background: 'var(--app-container-bg)' }}>
      {user && !isPublicRoute && <UserMenu />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/journal" component={() => <Journal onResetRef={journalResetRef} />} />
        <Route path="/insights" component={Report} />
        <Route path="/crisis-support" component={CrisisSupport} />
        <Route path="/account" component={Account} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/auth/error" component={AuthError} />
        <Route path="/password-reset/confirm" component={PasswordResetConfirm} />
        <Route path="/password-reset" component={PasswordResetRequest} />
        <Route path="/auth/email-unverified" component={EmailUnverified} />
        <Route path="/auth/account-locked" component={AccountLocked} />
        <Route path="/auth/session-expired" component={SessionExpired} />
        <Route path="/support" component={Support} />
        <Route path="/legal/terms" component={LegalTerms} />
        <Route path="/legal/privacy" component={LegalPrivacy} />
        <Route component={NotFound} />
      </Switch>
      {!hideBottomNavigation && (
        <BottomNavigation onJournalClick={() => journalResetRef.current?.()} />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="bg-stone-50 font-sans min-h-screen">
          <Toaster />
          <AuthProvider>
            <Router />
          </AuthProvider>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
