import { HealthCard } from "@/components/ui/health-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Brain, Zap, Shield, AlertCircle, TrendingUp } from "lucide-react";
import healthAnatomy from "@/assets/health-anatomy.png";

export function HealthTab() {
  const organScores = [
    { name: "Cardiovascular", score: 92, icon: Heart, status: "excellent", color: "success" },
    { name: "Liver", score: 78, icon: Shield, status: "good", color: "primary" },
    { name: "Kidneys", score: 85, icon: Zap, status: "good", color: "primary" },
    { name: "Mental Health", score: 88, icon: Brain, status: "good", color: "primary" },
    { name: "Metabolic", score: 65, icon: TrendingUp, status: "fair", color: "warning" },
    { name: "Respiratory", score: 82, icon: Zap, status: "good", color: "primary" }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Health</h1>
        
        {/* Overall Score */}
        <HealthCard 
          title="Overall Health" 
          value="87"
          subtitle="Excellent condition"
          variant="primary"
        >
          <div className="text-center space-y-4">
            <div>
              <h3 className="font-semibold text-primary-foreground mb-2">System Performance</h3>
              <div className="text-2xl font-bold text-primary-foreground">87/100</div>
              <p className="text-sm text-primary-foreground/80">All major systems operating well</p>
            </div>
          </div>
        </HealthCard>
      </div>

      {/* 3D Model Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Body Systems</h2>
          <Button size="sm" variant="outline">3D View</Button>
        </div>
        
        <div className="bg-gradient-card rounded-2xl border border-border p-6 text-center">
          <img 
            src={healthAnatomy} 
            alt="3D Human Anatomy" 
            className="w-32 h-32 mx-auto mb-4 opacity-80"
          />
          <p className="text-sm text-muted-foreground mb-4">
            Tap on organs to see detailed health insights
          </p>
          <Button variant="outline" className="w-full">
            Explore 3D Model
          </Button>
        </div>
      </div>

      {/* Organ Scores */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">System Scores</h2>
        
        <div className="grid grid-cols-1 gap-3">
          {organScores.map((organ, index) => {
            const Icon = organ.icon;
            const getVariant = (score: number) => {
              if (score >= 85) return "success";
              if (score >= 70) return "default"; 
              if (score >= 60) return "warning";
              return "danger";
            };
            
            return (
              <div key={index} className="p-4 bg-gradient-card rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{organ.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{organ.status}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground">{organ.score}</div>
                    <div className="text-xs text-muted-foreground">/ 100</div>
                  </div>
                </div>
                
                <Progress value={organ.score} className="h-2" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Health Insights */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Health Insights</h2>
        
        <HealthCard 
          title="Risk Factors" 
          value="2 Active"
          variant="warning"
          icon={<AlertCircle className="w-4 h-4" />}
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-warning rounded-full" />
              <span>Slightly elevated stress levels</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-warning rounded-full" />
              <span>Below optimal sleep duration</span>
            </div>
          </div>
        </HealthCard>
        
        <HealthCard 
          title="Recommendations" 
          value="3 Actions"
          variant="success"
        >
          <div className="space-y-2 text-sm">
            <div>• Increase daily water intake to 3L</div>
            <div>• Add 15min meditation to routine</div>
            <div>• Schedule annual blood work</div>
          </div>
        </HealthCard>
      </div>

      {/* Vitals Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Vitals</h2>
          <Button size="sm" variant="outline">Log Data</Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <HealthCard
            title="Blood Pressure"
            value="118/76"
            subtitle="Normal"
            trend="neutral"
          />
          
          <HealthCard
            title="Resting HR"
            value="62 bpm"
            subtitle="Excellent"
            trend="down"
          />
          
          <HealthCard
            title="Weight"
            value="175 lbs"
            subtitle="Stable"
            trend="neutral"
          />
          
          <HealthCard
            title="BMI"
            value="23.2"
            subtitle="Normal"
            trend="neutral"
          />
        </div>
      </div>
    </div>
  );
}