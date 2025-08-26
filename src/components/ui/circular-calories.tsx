import { cn } from "@/lib/utils";

interface MacroData {
  carbs: number;    // percentage (0-100)
  protein: number;  // percentage (0-100)
  fat: number;      // percentage (0-100)
}

interface CircularCaloriesProps {
  currentCalories: number;
  targetCalories: number;
  macros: MacroData;
  className?: string;
}

export function CircularCalories({
  currentCalories,
  targetCalories,
  macros,
  className
}: CircularCaloriesProps) {
  const progress = Math.min((currentCalories / targetCalories) * 100, 100);
  const remaining = Math.max(targetCalories - currentCalories, 0);

  // Calculate the circumference of the circle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  // Calculate arc lengths for each macro based on current calories consumed
  const totalMacroPercentage = macros.carbs + macros.protein + macros.fat;
  const normalizedMacros = totalMacroPercentage > 0 ? {
    carbs: (macros.carbs / totalMacroPercentage) * progress,
    protein: (macros.protein / totalMacroPercentage) * progress,
    fat: (macros.fat / totalMacroPercentage) * progress
  } : { carbs: 0, protein: 0, fat: 0 };

  // Convert percentages to stroke-dasharray values
  const carbsLength = (normalizedMacros.carbs / 100) * circumference;
  const proteinLength = (normalizedMacros.protein / 100) * circumference;
  const fatLength = (normalizedMacros.fat / 100) * circumference;

  // Calculate cumulative offsets for proper positioning
  const carbsOffset = circumference * 0.25; // Start at top
  const proteinOffset = carbsOffset - carbsLength;
  const fatOffset = proteinOffset - proteinLength;

  // Dynamic color calculation based on percentage completion
  const getColorForPercentage = (percentage: number): string => {
    if (percentage < 25) return '#EF4444'; // Red for very low
    if (percentage < 50) return '#F97316'; // Orange for low
    if (percentage < 75) return '#F59E0B'; // Yellow for medium
    if (percentage <= 100) return '#22C55E'; // Green for good
    if (percentage <= 120) return '#3B82F6'; // Blue for slightly over
    return '#8B5CF6'; // Purple for way over
  };

  const carbsColor = getColorForPercentage(macros.carbs);
  const proteinColor = getColorForPercentage(macros.protein);
  const fatColor = getColorForPercentage(macros.fat);
  
  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      {/* Circular Progress */}
      <div className="relative w-32 h-32">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            fill="none"
            className="opacity-20"
          />
          
          {/* Carbs (Blue) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#3B82F6" // Blue for carbs
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${carbsLength} ${circumference}`}
            strokeDashoffset={carbsOffset}
            className="transition-all duration-500 ease-out"
          />
          
          {/* Protein (Red) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#EF4444" // Red for protein
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${proteinLength} ${circumference}`}
            strokeDashoffset={proteinOffset}
            className="transition-all duration-500 ease-out"
          />
          
          {/* Fat (Yellow) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#F59E0B" // Yellow for fat
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${fatLength} ${circumference}`}
            strokeDashoffset={fatOffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-foreground">
            {currentCalories.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">calories</div>
        </div>
      </div>
      
      {/* Remaining calories */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground">
          {remaining > 0 ? `${remaining} remaining` : 'Goal reached!'}
        </div>
      </div>
      
      {/* Macro legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Carbs {macros.carbs.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Protein {macros.protein.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Fat {macros.fat.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
