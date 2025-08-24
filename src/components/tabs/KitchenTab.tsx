import { HealthCard } from "@/components/ui/health-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useFoodTracking } from "@/hooks/useFoodTracking";
import { useUserInfo } from "@/hooks/useUserInfo";
import { Plus, Search, Scan, Camera, Pill, Target, Loader2, Trash2 } from "lucide-react";
import { useState, useRef } from "react";

export function KitchenTab() {
  const { todaysNutrition, nutritionGoals, addMeal, removeMeal, analyzeFood } = useFoodTracking();
  const { userInfo } = useUserInfo();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualFood, setManualFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '',
    quantity: '1'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress('Reading image...');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const imageData = reader.result as string;

          setAnalysisProgress('Analyzing food with AI...');

          // Determine user's goal from their info
          const goal = userInfo.goals?.includes('lose_weight') ? 'lose_weight' :
                      userInfo.goals?.includes('gain_weight') ? 'gain_weight' : 'maintain';

          const analyzedFood = await analyzeFood(imageData, goal);

          setAnalysisProgress('Adding to diary...');

          // Add the analyzed food as a meal
          addMeal({
            foodItem: analyzedFood,
            quantity: 1,
            mealType: getCurrentMealType(),
            source: 'photo',
            imageUrl: imageData,
          });

          toast({
            title: "Food analyzed successfully!",
            description: `Added ${analyzedFood.name} (${analyzedFood.calories} cal) to your diary.`,
          });

        } catch (analysisError) {
          console.error('Food analysis error:', analysisError);
          toast({
            title: "Analysis failed",
            description: "AI couldn't analyze this image. You can add the food manually instead.",
            variant: "destructive",
          });
        }
      };

      reader.onerror = () => {
        toast({
          title: "File reading failed",
          description: "Couldn't read the image file. Please try again.",
          variant: "destructive",
        });
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Photo capture error:', error);
      toast({
        title: "Photo capture failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualEntry = () => {
    if (!manualFood.name || !manualFood.calories) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the food name and calories.",
        variant: "destructive",
      });
      return;
    }

    const foodItem = {
      id: Date.now().toString(),
      name: manualFood.name,
      calories: parseInt(manualFood.calories),
      macros: {
        protein: parseFloat(manualFood.protein) || 0,
        carbs: parseFloat(manualFood.carbs) || 0,
        fat: parseFloat(manualFood.fat) || 0,
      },
      servingSize: manualFood.servingSize || '1 serving',
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    addMeal({
      foodItem,
      quantity: parseFloat(manualFood.quantity) || 1,
      mealType: getCurrentMealType(),
      source: 'manual',
    });

    // Reset form
    setManualFood({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      servingSize: '',
      quantity: '1'
    });
    setShowManualEntry(false);

    toast({
      title: "Food added!",
      description: `Added ${foodItem.name} to your diary.`,
    });
  };

  const getCurrentMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const hour = new Date().getHours();
    if (hour < 10) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 19) return 'dinner';
    return 'snack';
  };

  const macroProgress = {
    protein: (todaysNutrition.totalMacros.protein / nutritionGoals.targetMacros.protein) * 100,
    carbs: (todaysNutrition.totalMacros.carbs / nutritionGoals.targetMacros.carbs) * 100,
    fat: (todaysNutrition.totalMacros.fat / nutritionGoals.targetMacros.fat) * 100,
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Kitchen</h1>
        
        {/* Daily Macros */}
        <HealthCard
          title="Daily Macros"
          value={`${Math.round(((macroProgress.protein + macroProgress.carbs + macroProgress.fat) / 3))}%`}
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
                  <span>{Math.round(todaysNutrition.totalMacros.protein)}g / {nutritionGoals.targetMacros.protein}g</span>
                </div>
                <Progress value={Math.min(macroProgress.protein, 100)} className="h-2" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm text-primary-foreground/90">
                  <span>Carbs</span>
                  <span>{Math.round(todaysNutrition.totalMacros.carbs)}g / {nutritionGoals.targetMacros.carbs}g</span>
                </div>
                <Progress value={Math.min(macroProgress.carbs, 100)} className="h-2" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm text-primary-foreground/90">
                  <span>Fat</span>
                  <span>{Math.round(todaysNutrition.totalMacros.fat)}g / {nutritionGoals.targetMacros.fat}g</span>
                </div>
                <Progress value={Math.min(macroProgress.fat, 100)} className="h-2" />
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
          <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <Search className="w-5 h-5" />
                <span className="text-xs">Manual</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Food Manually</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="foodName">Food Name *</Label>
                  <Input
                    id="foodName"
                    value={manualFood.name}
                    onChange={(e) => setManualFood(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Grilled Chicken Breast"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories *</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={manualFood.calories}
                      onChange={(e) => setManualFood(prev => ({ ...prev, calories: e.target.value }))}
                      placeholder="250"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.1"
                      value={manualFood.quantity}
                      onChange={(e) => setManualFood(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serving">Serving Size</Label>
                  <Input
                    id="serving"
                    value={manualFood.servingSize}
                    onChange={(e) => setManualFood(prev => ({ ...prev, servingSize: e.target.value }))}
                    placeholder="1 cup, 100g, 1 piece"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      value={manualFood.protein}
                      onChange={(e) => setManualFood(prev => ({ ...prev, protein: e.target.value }))}
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      value={manualFood.carbs}
                      onChange={(e) => setManualFood(prev => ({ ...prev, carbs: e.target.value }))}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      value={manualFood.fat}
                      onChange={(e) => setManualFood(prev => ({ ...prev, fat: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowManualEntry(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleManualEntry}>
                    Add Food
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="h-16 flex flex-col gap-2" disabled>
            <Scan className="w-5 h-5" />
            <span className="text-xs">Barcode</span>
          </Button>

          <Button
            variant="outline"
            className="h-16 flex flex-col gap-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
            <span className="text-xs text-center leading-tight">
              {isAnalyzing ? analysisProgress || 'Analyzing...' : 'Photo'}
            </span>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
        </div>
      </div>

      {/* Today's Meals */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Today's Meals</h2>

        <div className="space-y-3">
          {todaysNutrition.meals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No meals logged yet today.</p>
              <p className="text-sm">Take a photo or add manually to get started!</p>
            </div>
          ) : (
            todaysNutrition.meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg border border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">{meal.foodItem.name}</h3>
                    {meal.source === 'photo' && <Camera className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •
                    {Math.round(meal.foodItem.calories * meal.quantity)} cal •
                    {meal.quantity > 1 ? `${meal.quantity}x ` : ''}{meal.foodItem.servingSize}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    P: {Math.round(meal.foodItem.macros.protein * meal.quantity)}g •
                    C: {Math.round(meal.foodItem.macros.carbs * meal.quantity)}g •
                    F: {Math.round(meal.foodItem.macros.fat * meal.quantity)}g
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMeal(meal.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
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
