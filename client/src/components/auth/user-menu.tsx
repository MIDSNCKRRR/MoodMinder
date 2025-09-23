import { useLocation } from "wouter";
import { UserCircle, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "./auth-provider";
import { useLogoutMutation } from "@/hooks/use-auth";

export function UserMenu() {
  const { user } = useAuthContext();
  const logoutMutation = useLogoutMutation();
  const [, navigate] = useLocation();

  const handleAccountSelect = (event: Event) => {
    event.preventDefault();
    navigate("/account");
  };

  const handleLogoutSelect = (event: Event) => {
    event.preventDefault();
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/login"),
    });
  };

  return (
    <div className="absolute right-4 top-4 z-20">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 w-10 rounded-full bg-white/60 text-stone-600 shadow-sm hover:bg-white"
            aria-label="Open account menu"
          >
            <UserCircle className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            <p className="text-xs text-stone-400">Signed in as</p>
            <p className="text-sm font-medium text-stone-700 truncate">
              {user?.email ?? "Unknown user"}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={handleAccountSelect}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={handleLogoutSelect}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-2 text-coral-500 focus:text-coral-500"
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
