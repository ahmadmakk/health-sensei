import { HealthCard } from "@/components/ui/health-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Target, TrendingUp, Dumbbell, Calendar } from "lucide-react";

export function GymTab() {
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Gym</h1>
        
        {/* Today's Workout */}
        <HealthCard 
          title="Today's Workout" 
          value="Push Day"
          subtitle="Upper Body Focus"
          variant="primary"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary-foreground">Ready to Start</h3>
                <p className="text-sm text-primary-foreground/80">8 exercises • Est. 45-60 min</p>
              </div>
              <Dumbbell className="w-6 h-6 text-primary-foreground" />
            </div>
            
            <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Play className="w-4 h-4 mr-2" />
              Start Workout
            </Button>
          </div>
        </HealthCard>
      </div>

      {/* Workout Stats */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">This Week</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <HealthCard
            title="Sessions"
            value="4/6"
            subtitle="66% complete"
            icon={<Calendar className="w-4 h-4 text-primary" />}
            trend="up"
          />
          
          <HealthCard
            title="Duration"
            value="3.2h"
            subtitle="Avg 48 min"
            icon={<Clock className="w-4 h-4 text-success" />}
            trend="up"
          />
          
          <HealthCard
            title="Volume"
            value="12.5k"
            subtitle="lbs lifted"
            icon={<TrendingUp className="w-4 h-4 text-warning" />}
            trend="up"
          />
          
          <HealthCard
            title="Progress"
            value="87%"
            subtitle="Goal completion"
            icon={<Target className="w-4 h-4 text-success" />}
            variant="success"
          />
        </div>
      </div>

      {/* Workout Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Workout Plans</h2>
          <Button size="sm" variant="outline">Create New</Button>
        </div>
        
        <div className="space-y-3">
          {[
            { 
              name: "Push-Pull-Legs Split", 
              schedule: "6 days/week", 
              progress: 67,
              active: true 
            },
            { 
              name: "Upper-Lower Split", 
              schedule: "4 days/week", 
              progress: 0,
              active: false 
            },
            { 
              name: "Full Body Beginner", 
              schedule: "3 days/week", 
              progress: 100,
              active: false 
            }
          ].map((plan, index) => (
            <div key={index} className="p-4 bg-gradient-card rounded-lg border border-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">{plan.name}</h3>
                    {plan.active && <Badge variant="secondary">Active</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.schedule}</p>
                </div>
                <Button size="sm" variant={plan.active ? "default" : "outline"}>
                  {plan.active ? "Continue" : "Start"}
                </Button>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground">{plan.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Sessions</h2>
        
        <div className="space-y-3">
          {[
            { 
              type: "Push Day", 
              duration: "52 min", 
              date: "Today", 
              exercises: 8,
              volume: "3.2k lbs"
            },
            { 
              type: "Pull Day", 
              duration: "48 min", 
              date: "Yesterday", 
              exercises: 7,
              volume: "2.8k lbs"
            },
            { 
              type: "Legs", 
              duration: "65 min", 
              date: "2 days ago", 
              exercises: 6,
              volume: "4.1k lbs"
            }
          ].map((session, index) => (
            <div key={index} className="p-4 bg-gradient-card rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-foreground">{session.type}</h3>
                <span className="text-sm text-muted-foreground">{session.date}</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>⏱ {session.duration}</span>
                <span>🏋️ {session.exercises} exercises</span>
                <span>📊 {session.volume}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}