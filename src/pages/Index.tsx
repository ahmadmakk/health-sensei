import { useState } from "react";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useUserInfo } from "@/hooks/useUserInfo";
import { HomeTab } from "@/components/tabs/HomeTab";
import { KitchenTab } from "@/components/tabs/KitchenTab";
import { GymTab } from "@/components/tabs/GymTab";
import { HealthTab } from "@/components/tabs/HealthTab";
import { MindTab } from "@/components/tabs/MindTab";
import { ProfileTab } from "@/components/tabs/ProfileTab";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { isOnboardingComplete } = useUserInfo();
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingComplete);
  const [showMenu, setShowMenu] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab />;
      case "kitchen":
        return <KitchenTab />;
      case "gym":
        return <GymTab />;
      case "health":
        return <HealthTab />;
      case "mind":
        return <MindTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return <HomeTab />;
    }
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top header with hamburger */}
      <div className="px-4 pt-4 pb-0 flex items-center">
        <Dialog open={showMenu} onOpenChange={setShowMenu}>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle>Menu</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Button variant="ghost" className="w-full text-left" onClick={() => { setActiveTab('profile'); setShowMenu(false); }}>
                Profile
              </Button>
              <Button variant="ghost" className="w-full text-left" onClick={() => { setActiveTab('profile'); setShowMenu(false); }}>
                Personal Info
              </Button>
              <Button variant="ghost" className="w-full text-left" onClick={() => { localStorage.removeItem('healthai_user_info'); window.location.reload(); }}>
                Reset Onboarding
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="pr-3">
          <button
            aria-label="Open menu"
            className="p-2 rounded-md hover:bg-muted"
            onClick={() => setShowMenu(true)}
          >
            <Menu />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-2 pb-20">
        {renderActiveTab()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default Index;
