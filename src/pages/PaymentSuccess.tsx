import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentRef = reference || trxref;
      
      if (paymentRef) {
        try {
          const { data, error } = await supabase.functions.invoke(
            'verify-paystack-payment',
            {
              body: { reference: paymentRef }
            }
          );

          if (error || data.status !== 'success') {
            console.error('Payment verification failed:', error);
            toast({
              title: "Payment Verification",
              description: "We're verifying your payment. Please check back in a few minutes.",
              variant: "default",
            });
          } else {
            toast({
              title: "Payment Verified!",
              description: "Your premium subscription is now active.",
            });
          }
        } catch (error) {
          console.error('Verification error:', error);
        }
      }
    };

    if (reference || trxref) {
      verifyPayment();
    }
  }, [reference, trxref, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/20 p-3">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-primary" />
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you for upgrading to Premium! Your account has been upgraded and you now have access to all premium features.
          </p>
          
          <div className="bg-primary/10 rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-2">What's Next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Export your mood data anytime</li>
              <li>• Access advanced analytics</li>
              <li>• Get AI-powered insights</li>
              <li>• Use custom mood tags</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="w-full"
            >
              Start Using Premium Features
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;