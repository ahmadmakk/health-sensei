import { HealthCard } from "@/components/ui/health-card";
import { Button } from "@/components/ui/button";
import { Utensils, Dumbbell, Heart, Brain, Zap, TrendingUp } from "lucide-react";
import healthHero from "@/assets/health-hero.png";

export function HomeTab() {
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="relative bg-gradient-primary rounded-2xl p-6 text-primary-foreground overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">Good Morning, Alex!</h1>
          <p className="text-primary-foreground/80">Your health journey continues today</p>
        </div>
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary-foreground/10 rounded-full animate-pulse-glow" />
      </div>

      {/* Daily Summary */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Today's Overview</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <HealthCard
            title="Calories"
            value="1,847"
            subtitle="573 remaining"
            icon={<Zap className="w-4 h-4 text-warning" />}
            trend="up"
          />
          
          <HealthCard
            title="Macros"
            value="72%"
            subtitle="On track"
            icon={<TrendingUp className="w-4 h-4 text-success" />}
            trend="up"
          />
          
          <HealthCard
            title="Workout"
            value="45min"
            subtitle="Push day completed"
            icon={<Dumbbell className="w-4 h-4 text-primary" />}
            variant="success"
          />
          
          <HealthCard
            title="Health Score"
            value="87"
            subtitle="Excellent"
            icon={<Heart className="w-4 h-4 text-destructive" />}
            trend="up"
          />
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">AI Recommendations</h2>
        
        <HealthCard 
          title="AI Insights" 
          value="3 Actions" 
          variant="primary" 
          className="relative overflow-hidden"
        >
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-primary-foreground mt-1" />
            <div>
              <h3 className="font-semibold text-primary-foreground mb-2">Next Best Actions</h3>
              <ul className="space-y-2 text-sm text-primary-foreground/90">
                <li>• Add 20g protein to reach daily target</li>
                <li>• Take 10-minute walk after lunch</li>
                <li>• Consider magnesium supplement tonight</li>
              </ul>
            </div>
          </div>
        </HealthCard>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Utensils className="w-5 h-5" />
            <span className="text-sm">Log Meal</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Dumbbell className="w-5 h-5" />
            <span className="text-sm">Start Workout</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Heart className="w-5 h-5" />
            <span className="text-sm">Health Check</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Brain className="w-5 h-5" />
            <span className="text-sm">Mood Log</span>
          </Button>
        </div>
      </div>
    </div>
  );
}