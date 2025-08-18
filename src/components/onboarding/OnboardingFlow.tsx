import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserInfo } from '@/hooks/useUserInfo';
import { UserInfo } from '@/types/userInfo';
import { Heart, User, Target, MapPin, Activity, Shield } from 'lucide-react';

const ONBOARDING_STEPS = [
  { id: 'basic', title: 'Basic Info', icon: User },
  { id: 'physical', title: 'Physical Stats', icon: Activity },
  { id: 'location', title: 'Location & Lifestyle', icon: MapPin },
  { id: 'goals', title: 'Goals & Beliefs', icon: Target },
  { id: 'health', title: 'Health Info', icon: Heart },
  { id: 'privacy', title: 'Privacy Notice', icon: Shield },
];

const COMMON_GOALS = [
  'Weight Loss', 'Weight Gain', 'Muscle Building', 'Better Sleep',
  'Stress Management', 'Improved Energy', 'Heart Health', 'Mental Wellness'
];

const COMMON_CONDITIONS = [
  'Diabetes', 'High Blood Pressure', 'High Cholesterol', 'Arthritis',
  'Asthma', 'Depression', 'Anxiety', 'Thyroid Issues'
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { userInfo, updateUserInfo } = useUserInfo();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<UserInfo>>(userInfo);

  const updateFormData = (updates: Partial<UserInfo>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (array: string[] = [], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      updateUserInfo({ 
        ...formData, 
        onboardingCompleted: true 
      });
      onComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      updateUserInfo({ onboardingCompleted: true });
      onComplete();
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle>{currentStepData.title}</CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {ONBOARDING_STEPS.length} (All fields are optional)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {currentStep === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="How should we call you?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => updateFormData({ age: parseInt(e.target.value) || undefined })}
                  placeholder="Your age"
                />
              </div>
              <div className="space-y-2">
                <Label>Sex</Label>
                <RadioGroup
                  value={formData.sex || ''}
                  onValueChange={(value) => updateFormData({ sex: value as any })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                    <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => updateFormData({ weight: parseFloat(e.target.value) || undefined })}
                  placeholder="Your weight in kg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => updateFormData({ height: parseFloat(e.target.value) || undefined })}
                  placeholder="Your height in cm"
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => updateFormData({ location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label>Activity Level</Label>
                <RadioGroup
                  value={formData.lifestyle || ''}
                  onValueChange={(value) => updateFormData({ lifestyle: value as any })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sedentary" id="sedentary" />
                    <Label htmlFor="sedentary">Sedentary (little to no exercise)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lightly-active" id="lightly-active" />
                    <Label htmlFor="lightly-active">Lightly active (1-3 days/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderately-active" id="moderately-active" />
                    <Label htmlFor="moderately-active">Moderately active (3-5 days/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="very-active" id="very-active" />
                    <Label htmlFor="very-active">Very active (6-7 days/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="extremely-active" id="extremely-active" />
                    <Label htmlFor="extremely-active">Extremely active (2x/day or intense training)</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="space-y-2">
                <Label>Health Goals</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_GOALS.map((goal) => (
                    <Badge
                      key={goal}
                      variant={formData.goals?.includes(goal) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => updateFormData({ 
                        goals: toggleArrayItem(formData.goals, goal) 
                      })}
                    >
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="beliefs">Dietary/Religious Considerations</Label>
                <Textarea
                  id="beliefs"
                  value={formData.beliefs || ''}
                  onChange={(e) => updateFormData({ beliefs: e.target.value })}
                  placeholder="e.g., Vegetarian, Halal, Kosher, Food allergies..."
                />
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <div className="space-y-2">
                <Label>Health Conditions</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CONDITIONS.map((condition) => (
                    <Badge
                      key={condition}
                      variant={formData.healthConditions?.includes(condition) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => updateFormData({ 
                        healthConditions: toggleArrayItem(formData.healthConditions, condition) 
                      })}
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  value={formData.medications?.join(', ') || ''}
                  onChange={(e) => updateFormData({ 
                    medications: e.target.value.split(',').map(m => m.trim()).filter(Boolean)
                  })}
                  placeholder="List any medications you're currently taking..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies?.join(', ') || ''}
                  onChange={(e) => updateFormData({ 
                    allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
                  })}
                  placeholder="Food allergies, medication allergies, etc..."
                />
              </div>
            </>
          )}

          {currentStep === 5 && (
            <div className="space-y-4 text-center">
              <Shield className="w-16 h-16 text-primary mx-auto" />
              <div className="space-y-2">
                <h3 className="font-semibold">Your Privacy Matters</h3>
                <p className="text-sm text-muted-foreground">
                  All your health information is stored locally on your device only. 
                  We never send your personal data to our servers.
                </p>
                <p className="text-sm text-muted-foreground">
                  When you chat with our AI, only the relevant context is included 
                  in your conversation - your data never leaves your control.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip
            </Button>
            <Button onClick={handleNext} className="flex-1">
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}