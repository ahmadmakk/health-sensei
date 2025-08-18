import { HealthCard } from "@/components/ui/health-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Brain, Heart, MessageCircle, TrendingUp, Calendar } from "lucide-react";

export function MindTab() {
  const moodData = [
    { day: "Mon", mood: 4, stress: 2 },
    { day: "Tue", mood: 5, stress: 3 },
    { day: "Wed", mood: 3, stress: 4 },
    { day: "Thu", mood: 4, stress: 2 },
    { day: "Fri", mood: 5, stress: 1 },
    { day: "Sat", mood: 4, stress: 2 },
    { day: "Sun", mood: 4, stress: 3 }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Mind</h1>
        
        {/* Mental Health Overview */}
        <HealthCard 
          title="Mental Wellness" 
          value="4.1/5"
          subtitle="Weekly average improving"
          variant="primary"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary-foreground">Wellness Overview</h3>
                <p className="text-sm text-primary-foreground/80">Tracking mood and stress patterns</p>
              </div>
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">4.1</div>
                <div className="text-sm text-primary-foreground/80">Mood Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">2.4</div>
                <div className="text-sm text-primary-foreground/80">Stress Level</div>
              </div>
            </div>
          </div>
        </HealthCard>
      </div>

      {/* Mood Tracking */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Mood Tracking</h2>
          <Button size="sm" variant="outline">Log Mood</Button>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {moodData.map((day, index) => (
            <div key={index} className="text-center p-3 bg-gradient-card rounded-lg border border-border">
              <div className="text-sm font-medium text-muted-foreground mb-2">{day.day}</div>
              
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Mood</div>
                <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                  day.mood >= 4 ? 'bg-success text-success-foreground' : 
                  day.mood >= 3 ? 'bg-warning text-warning-foreground' : 
                  'bg-destructive text-destructive-foreground'
                }`}>
                  {day.mood}
                </div>
                
                <div className="text-xs text-muted-foreground">Stress</div>
                <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                  day.stress <= 2 ? 'bg-success text-success-foreground' : 
                  day.stress <= 3 ? 'bg-warning text-warning-foreground' : 
                  'bg-destructive text-destructive-foreground'
                }`}>
                  {day.stress}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mental Health Stats */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">This Week</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <HealthCard
            title="Check-ins"
            value="6/7"
            subtitle="Great consistency"
            icon={<Calendar className="w-4 h-4 text-primary" />}
            trend="up"
          />
          
          <HealthCard
            title="Avg Mood"
            value="4.1/5"
            subtitle="Above baseline"
            icon={<Heart className="w-4 h-4 text-success" />}
            trend="up"
          />
          
          <HealthCard
            title="Stress Level"
            value="2.4/5"
            subtitle="Well managed"
            icon={<TrendingUp className="w-4 h-4 text-success" />}
            trend="down"
          />
          
          <HealthCard
            title="Sessions"
            value="3"
            subtitle="Therapy chats"
            icon={<MessageCircle className="w-4 h-4 text-primary" />}
            variant="default"
          />
        </div>
      </div>

      {/* AI Therapist Chat */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">AI Therapist</h2>
          <Badge variant="secondary">Always Available</Badge>
        </div>
        
        <div className="bg-gradient-card rounded-lg border border-border p-4">
          <ScrollArea className="h-64 w-full">
            <div className="space-y-4">
              {/* Sample conversation */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm text-foreground">
                      Hello! I'm here to support your mental wellness journey. How are you feeling today?
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-primary rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm text-primary-foreground">
                      I've been feeling a bit stressed with work lately. Having trouble sleeping.
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-bold">A</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm text-foreground">
                      I understand work stress can be challenging. Let's explore some techniques that might help. Have you tried any relaxation methods before bed?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex gap-2 mt-4">
            <Input 
              placeholder="Share what's on your mind..." 
              className="flex-1"
            />
            <Button size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 text-center">
            ⚠️ For emergencies, contact your local crisis helpline
          </div>
        </div>
      </div>

      {/* Quick Mood Check */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Check-in</h2>
        
        <div className="space-y-3">
          <div className="p-4 bg-gradient-card rounded-lg border border-border">
            <h3 className="font-medium text-foreground mb-3">How's your mood right now?</h3>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((mood) => (
                <Button
                  key={mood}
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-full"
                >
                  {mood === 1 ? '😢' : mood === 2 ? '😕' : mood === 3 ? '😐' : mood === 4 ? '😊' : '😄'}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-gradient-card rounded-lg border border-border">
            <h3 className="font-medium text-foreground mb-3">Stress level today?</h3>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((stress) => (
                <Button
                  key={stress}
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-full"
                >
                  {stress}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Very Low</span>
              <span>Very High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}