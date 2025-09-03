import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const PremiumUpgrade = () => {
  const { user } = useAuth();
  const { isPremium, refreshPremiumStatus } = usePremium();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async (planType: 'lifetime' | 'monthly') => {
    if (!user || !window.PaystackPop) {
      toast({
        title: "Payment Error",
        description: "Payment system not loaded. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowPlanDialog(false);

    try {
      const amount = planType === 'lifetime' ? 9999 : 1999; // $99.99 lifetime, $19.99 monthly
      
      // Initialize payment with backend
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'paystack-payment',
        {
          body: { 
            amount,
            metadata: {
              plan_type: planType,
              feature: 'premium_upgrade'
            }
          }
        }
      );

      if (paymentError || paymentData.status !== 'success') {
        throw new Error('Failed to initialize payment');
      }

      const handler = window.PaystackPop.setup({
        key: paymentData.data.access_code,
        email: paymentData.data.customer?.email,
        amount: paymentData.data.amount,
        currency: 'USD',
        ref: paymentData.data.reference,
        metadata: {
          plan_type: planType,
          custom_fields: [
            {
              display_name: "Plan Type",
              variable_name: "plan_type",
              value: planType === 'lifetime' ? 'Lifetime Premium' : 'Monthly Premium'
            }
          ]
        },
        callback: async (response: any) => {
          console.log('Payment response:', response);
          
          if (response.status === 'success') {
            try {
              // Verify payment with backend
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
                'verify-paystack-payment',
                {
                  body: { reference: response.reference }
                }
              );

              if (verifyError || verifyData.status !== 'success') {
                throw new Error('Payment verification failed');
              }

              await refreshPremiumStatus();
              
              toast({
                title: "🎉 Welcome to Premium!",
                description: `Your ${planType === 'lifetime' ? 'lifetime' : 'monthly'} premium subscription is now active.`,
              });
            } catch (error) {
              console.error('Payment verification error:', error);
              toast({
                title: "Payment Verification Failed",
                description: "Please contact support if this issue persists.",
                variant: "destructive",
              });
            }
          } else {
            toast({
              title: "Payment Failed",
              description: "Your payment could not be processed. Please try again.",
              variant: "destructive",
            });
          }
          
          setLoading(false);
        },
        onClose: () => {
          console.log('Payment cancelled');
          setLoading(false);
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <>
      {isPremium ? (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Crown className="h-5 w-5" />
              Premium Member
              <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary border-primary/30">
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have access to all premium features including advanced analytics,
              data export, custom mood tags, and priority AI insights.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Upgrade to Premium
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Premium Features:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-primary" />
                    Export mood data (CSV, PDF)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-primary" />
                    Advanced analytics & trends
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-primary" />
                    AI-powered reports & insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-primary" />
                    Custom mood tags
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-primary" />
                    Priority AI insights
                  </li>
                </ul>
              </div>
              <Button 
                onClick={() => setShowPlanDialog(true)}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Choose Premium Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Choose Your Premium Plan
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Card className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Lifetime Premium</h3>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">Best Value</Badge>
                    </div>
                    <p className="text-2xl font-bold text-primary mb-2">$99.99</p>
                    <p className="text-sm text-muted-foreground mb-4">One-time payment, lifetime access</p>
                    <Button 
                      onClick={() => handlePayment('lifetime')}
                      disabled={loading}
                      className="w-full"
                    >
                      Get Lifetime Access
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Monthly Premium</h3>
                    <p className="text-2xl font-bold mb-2">$19.99</p>
                    <p className="text-sm text-muted-foreground mb-4">Per month, cancel anytime</p>
                    <Button 
                      onClick={() => handlePayment('monthly')}
                      disabled={loading}
                      variant="outline"
                      className="w-full"
                    >
                      Start Monthly Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};