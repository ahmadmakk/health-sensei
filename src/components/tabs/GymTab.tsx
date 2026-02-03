import { HealthCard } from "@/components/ui/health-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Target, TrendingUp, Dumbbell, Calendar } from "lucide-react";
import { useUserInfo } from "@/hooks/useUserInfo";

export function GymTab() {
  const { userInfo } = useUserInfo();

  const goal = (userInfo.goals || []).join(', ').toLowerCase();
  const lifestyle = userInfo.lifestyle || 'moderately-active';

  const suggestedPlan = (() => {
    if (goal.includes('gain') || goal.includes('muscle') || goal.includes('strength')) {
      return { name: 'Push-Pull-Legs Split', scheduleDays: 6 };
    }
    if (goal.includes('lose') || goal.includes('fat')) {
      return { name: 'Full Body + Cardio', scheduleDays: 4 };
    }
    return { name: 'Upper-Lower Split', scheduleDays: 4 };
  })();

  const sessionsGoal = (() => {
    switch (lifestyle) {
      case 'sedentary': return 3;
      case 'lightly-active': return 4;
      case 'moderately-active': return 5;
      case 'very-active': return 6;
      case 'extremely-active': return 7;
      default: return 4;
    }
  })();

  const plans = [
    { name: 'Push-Pull-Legs Split', schedule: '6 days/week' },
    { name: 'Upper-Lower Split', schedule: '4 days/week' },
    { name: 'Full Body Beginner', schedule: '3 days/week' },
    { name: 'Full Body + Cardio', schedule: '4 days/week' },
  ].map(p => ({
    ...p,
    progress: 0,
    active: p.name === suggestedPlan.name,
  }));

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Gym</h1>

        {/* Today's Workout */}
        <HealthCard
          title="Today's Workout"
          value={suggestedPlan.name}
          subtitle={goal ? `Based on your goals: ${goal}` : 'Personalized by your profile'}
          variant="primary"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary-foreground">Ready to Start</h3>
                <p className="text-sm text-primary-foreground/80">Est. 45-60 min</p>
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
            value={`0/${sessionsGoal}`}
            subtitle={`${Math.round((0 / sessionsGoal) * 100)}% complete`}
            icon={<Calendar className="w-4 h-4 text-primary" />}
            trend="neutral"
          />

          <HealthCard
            title="Duration"
            value="—"
            subtitle="Avg —"
            icon={<Clock className="w-4 h-4 text-success" />}
            trend="neutral"
          />

          <HealthCard
            title="Volume"
            value="—"
            subtitle="—"
            icon={<TrendingUp className="w-4 h-4 text-warning" />}
            trend="neutral"
          />

          <HealthCard
            title="Progress"
            value="—"
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
          {plans.map((plan, index) => (
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
            { type: suggestedPlan.name, duration: "—", date: "—", exercises: 0, volume: "—" },
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
