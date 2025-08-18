import { HealthCard } from "@/components/ui/health-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Scan, Camera, Pill, Target } from "lucide-react";

export function KitchenTab() {
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Kitchen</h1>
        
        {/* Daily Macros */}
        <HealthCard 
          title="Daily Macros" 
          value="85%" 
          subtitle="Target completion"
          variant="primary"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-primary-foreground">Macro Breakdown</h3>
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-primary-foreground/90">
                  <span>Protein</span>
                  <span>127g / 150g</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-primary-foreground/90">
                  <span>Carbs</span>
                  <span>180g / 200g</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-primary-foreground/90">
                  <span>Fat</span>
                  <span>65g / 80g</span>
                </div>
                <Progress value={81} className="h-2" />
              </div>
            </div>
          </div>
        </HealthCard>
      </div>

      {/* Log Meal Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Log Your Meal</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search foods..." 
            className="pl-10 h-12"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <Search className="w-5 h-5" />
            <span className="text-xs">Search</span>
          </Button>
          
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <Scan className="w-5 h-5" />
            <span className="text-xs">Barcode</span>
          </Button>
          
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <Camera className="w-5 h-5" />
            <span className="text-xs">Photo</span>
          </Button>
        </div>
      </div>

      {/* Recent Meals */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Meals</h2>
        
        <div className="space-y-3">
          {[
            { name: "Greek Yogurt with Berries", calories: 180, time: "8:30 AM" },
            { name: "Grilled Chicken Salad", calories: 420, time: "12:45 PM" },
            { name: "Protein Smoothie", calories: 280, time: "3:20 PM" }
          ].map((meal, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg border border-border">
              <div>
                <h3 className="font-medium text-foreground">{meal.name}</h3>
                <p className="text-sm text-muted-foreground">{meal.time} • {meal.calories} cal</p>
              </div>
              <Button size="sm" variant="ghost">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Supplements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Supplements</h2>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <HealthCard
            title="Vitamin D"
            value="✓"
            subtitle="Taken today"
            icon={<Pill className="w-4 h-4 text-success" />}
            variant="success"
          />
          
          <HealthCard
            title="Omega-3"
            value="!"
            subtitle="Missed"
            icon={<Pill className="w-4 h-4 text-warning" />}
            variant="warning"
          />
        </div>
      </div>
    </div>
  );
}