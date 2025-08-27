import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { MotivationalQuote as QuoteType } from "@/hooks/useMotivationalQuotes";

interface MotivationalQuoteProps {
  quote: QuoteType;
}

export const MotivationalQuote = ({ quote }: MotivationalQuoteProps) => {
  const getQuoteStyle = () => {
    switch (quote.category) {
      case 'positive':
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
      case 'encouraging':
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
      default:
        return "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950";
    }
  };

  const getIconColor = () => {
    switch (quote.category) {
      case 'positive':
        return "text-green-600 dark:text-green-400";
      case 'encouraging':
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-purple-600 dark:text-purple-400";
    }
  };

  return (
    <Card className={`${getQuoteStyle()} transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Quote className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getIconColor()}`} />
          <p className="text-sm font-medium leading-relaxed">
            {quote.text}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};