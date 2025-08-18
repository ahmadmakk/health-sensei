import { useState } from "react";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useUserInfo } from "@/hooks/useUserInfo";
import { HomeTab } from "@/components/tabs/HomeTab";
import { KitchenTab } from "@/components/tabs/KitchenTab";
import { GymTab } from "@/components/tabs/GymTab";
import { HealthTab } from "@/components/tabs/HealthTab";
import { MindTab } from "@/components/tabs/MindTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { isOnboardingComplete } = useUserInfo();
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingComplete);

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
      default:
        return <HomeTab />;
    }
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="px-4 pt-6 pb-20">
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
