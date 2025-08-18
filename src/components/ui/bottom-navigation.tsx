import { cn } from "@/lib/utils";
import { Home, ChefHat, Dumbbell, Heart, Brain } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", icon: Home, label: "Home" },
  { id: "kitchen", icon: ChefHat, label: "Kitchen" },
  { id: "gym", icon: Dumbbell, label: "Gym" },
  { id: "health", icon: Heart, label: "Health" },
  { id: "mind", icon: Brain, label: "Mind" },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-200",
                isActive && "bg-primary/10 shadow-soft"
              )}>
                <Icon 
                  size={20} 
                  className={cn(
                    "transition-all duration-200",
                    isActive && "animate-pulse-glow"
                  )} 
                />
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-10 animate-pulse-glow" />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium mt-1 transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}