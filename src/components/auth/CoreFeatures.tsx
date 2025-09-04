import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  Lightbulb, 
  Crown, 
  CreditCard 
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Mood Detection',
    description: 'Detect emotions from journal entries using AI.',
    gradient: 'from-purple-500 to-indigo-500'
  },
  {
    icon: TrendingUp,
    title: 'Mood Tracking & Charts',
    description: 'Visualize your mood trends with easy-to-read charts.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Calendar,
    title: 'Daily Journaling Streaks',
    description: 'Earn streaks for consistent journaling.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Lightbulb,
    title: 'Smart Recommendations',
    description: 'AI suggests wellness tips based on your mood.',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Crown,
    title: 'Premium Features',
    description: 'Export data, advanced analytics, and more.',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Pay securely via Paystack for premium upgrades.',
    gradient: 'from-violet-500 to-purple-500'
  }
];

export const CoreFeatures = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">Why Choose Mood Journal?</h3>
          <p className="text-sm text-muted-foreground">
            Discover powerful features designed to enhance your emotional well-being
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-300 hover:scale-105 cursor-default"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-full bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Join thousands of users tracking their emotional journey with AI-powered insights
          </p>
        </div>
      </CardContent>
    </Card>
  );
};