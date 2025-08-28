import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Lightbulb, CheckCircle } from "lucide-react";
import { useState } from "react";

interface CopingStrategyProps {
  strategy: string;
  emotions: string[];
  onMarkCompleted?: () => void;
}

export const CopingStrategy = ({ strategy, emotions, onMarkCompleted }: CopingStrategyProps) => {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    onMarkCompleted?.();
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      stress: "bg-orange-100 text-orange-800 border-orange-200",
      anxiety: "bg-yellow-100 text-yellow-800 border-yellow-200",
      sadness: "bg-blue-100 text-blue-800 border-blue-200",
      anger: "bg-red-100 text-red-800 border-red-200",
      joy: "bg-green-100 text-green-800 border-green-200",
      fear: "bg-purple-100 text-purple-800 border-purple-200",
      neutral: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[emotion as keyof typeof colors] || colors.neutral;
  };

  if (!strategy) return null;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
          Personalized Coping Strategy
        </CardTitle>
        <CardDescription>
          Based on your emotions: {emotions.map((emotion, index) => (
            <Badge 
              key={emotion} 
              variant="outline" 
              className={`ml-1 ${getEmotionColor(emotion)}`}
            >
              {emotion}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-foreground leading-relaxed">{strategy}</p>
        </div>
        
        {!completed ? (
          <Button 
            onClick={handleComplete}
            variant="outline" 
            className="w-full"
          >
            Mark as Completed
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Strategy completed! Great job taking care of yourself.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};