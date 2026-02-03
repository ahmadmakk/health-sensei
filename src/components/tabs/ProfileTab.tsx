import { HealthCard } from "@/components/ui/health-card";
import { Button } from "@/components/ui/button";
import { useUserInfo } from "@/hooks/useUserInfo";

export function ProfileTab() {
  const { userInfo, resetUserInfo } = useUserInfo();

  const entries: { label: string; value: string }[] = [
    { label: 'Name', value: userInfo.name ?? '—' },
    { label: 'Age', value: userInfo.age !== undefined ? String(userInfo.age) : '—' },
    { label: 'Sex', value: userInfo.sex ?? '—' },
    { label: 'Weight', value: userInfo.weight !== undefined ? `${userInfo.weight} kg` : '—' },
    { label: 'Height', value: userInfo.height !== undefined ? `${userInfo.height} cm` : '—' },
    { label: 'Location', value: userInfo.location ?? '—' },
    { label: 'Lifestyle', value: userInfo.lifestyle ?? '—' },
    { label: 'Preferred Units', value: userInfo.preferredUnits ?? 'metric' },
    { label: 'Goals', value: (userInfo.goals && userInfo.goals.length) ? userInfo.goals.join(', ') : '—' },
    { label: 'Beliefs', value: userInfo.beliefs ?? '—' },
    { label: 'Health Conditions', value: (userInfo.healthConditions && userInfo.healthConditions.length) ? userInfo.healthConditions.join(', ') : '—' },
    { label: 'Medications', value: (userInfo.medications && userInfo.medications.length) ? userInfo.medications.join(', ') : '—' },
    { label: 'Allergies', value: (userInfo.allergies && userInfo.allergies.length) ? userInfo.allergies.join(', ') : '—' },
    { label: 'Onboarding Completed', value: userInfo.onboardingCompleted ? 'Yes' : 'No' },
    { label: 'Last Updated', value: userInfo.lastUpdated ?? '—' },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Personal Info</h1>
        <p className="text-sm text-muted-foreground">All fields are pulled from your profile and onboarding.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {entries.map((entry) => (
          <HealthCard key={entry.label} title={entry.label} value={entry.value} />
        ))}
      </div>

      <div className="pt-4">
        <Button variant="outline" onClick={() => resetUserInfo()}>
          Reset Personal Info
        </Button>
      </div>
    </div>
  );
}
