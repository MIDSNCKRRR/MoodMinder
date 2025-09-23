import type { ReactNode } from "react";
import logoImage from "@/assets/image/logo.png";

interface AuthShellProps {
  children: ReactNode;
  footer?: ReactNode;
  eyebrow?: string;
  eyebrowRightSlot?: ReactNode;
  brandSubtitle?: string;
  brandTitle?: string;
}

export function AuthShell({
  children,
  footer,
  eyebrow = "Welcome back",
  eyebrowRightSlot,
  brandSubtitle = "Your emotional wellness companion",
  brandTitle = "Soft Moves",
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen px-6 pb-10 pt-8 flex flex-col gap-8">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-12 -right-10 h-48 w-48 rounded-full bg-peach-100 blur-3xl opacity-80" />
        <div className="absolute top-36 -left-16 h-56 w-56 rounded-full bg-lavender-100 blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-8 h-32 w-32 rounded-full bg-sage-100 blur-2xl opacity-60" />
      </div>

      <div className="flex justify-between items-center text-stone-400 text-sm">
        <span className="tracking-wider uppercase text-xs">{eyebrow}</span>
        {eyebrowRightSlot ?? (
          <div className="flex space-x-1">
            <div className="w-4 h-2 bg-stone-300 rounded-sm" />
            <div className="w-4 h-2 bg-stone-300 rounded-sm" />
            <div className="w-6 h-2 bg-stone-300 rounded-sm" />
          </div>
        )}
      </div>

      <div className="text-center space-y-3">
        <div className="w-20 h-20 mx-auto rounded-full bg-white/80 flex items-center justify-center shadow-sm">
          <img
            src={logoImage}
            alt="Soft Moves Logo"
            className="w-16 h-16 object-contain"
            loading="eager"
          />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-semibold text-stone-600">{brandTitle}</h1>
          <p className="text-stone-400 text-sm mt-1">{brandSubtitle}</p>
        </div>
      </div>

      {children}

      {footer && <div className="text-center text-sm text-stone-500">{footer}</div>}
    </div>
  );
}
