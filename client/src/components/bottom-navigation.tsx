import { Link, useLocation, useRouter } from "wouter";
import { Home, BookOpen, BarChart3 } from "lucide-react";

interface BottomNavigationProps {
  onJournalClick?: () => void;
}

export default function BottomNavigation({ onJournalClick }: BottomNavigationProps = {}) {
  const [location, navigate] = useLocation();

  const tabs = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/journal", icon: BookOpen, label: "Journal" },
    { path: "/report", icon: BarChart3, label: "Insights" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-stone-200 stone-shadow z-50">
      <div className="flex justify-around py-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path;
          
          if (tab.label === "Journal") {
            return (
              <button 
                key={tab.path}
                onClick={() => {
                  if (location === "/journal" && onJournalClick) {
                    // If already on journal page, call the reset function
                    onJournalClick();
                  } else {
                    // Otherwise navigate using wouter
                    navigate(tab.path);
                  }
                }}
                className={`flex flex-col items-center space-y-1 transition-colors ${
                  isActive ? "text-peach-500" : "text-stone-400 hover:text-peach-500"
                }`}
                data-testid={`nav-${tab.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          }
          
          return (
            <Link key={tab.path} href={tab.path}>
              <button 
                className={`flex flex-col items-center space-y-1 transition-colors ${
                  isActive ? "text-peach-500" : "text-stone-400 hover:text-peach-500"
                }`}
                data-testid={`nav-${tab.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
