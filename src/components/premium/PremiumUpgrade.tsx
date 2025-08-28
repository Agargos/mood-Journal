import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    FlutterwaveCheckout: any;
  }
}

export const PremiumUpgrade = () => {
  const { user } = useAuth();
  const { isPremium, refreshPremiumStatus } = usePremium();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    if (!user) return;

    setLoading(true);

    const modal = window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-b1b19b35e6ab0c7f51e15a9e81ad5fba-X", // Flutterwave test public key
      tx_ref: `premium_${user.id}_${Date.now()}`,
      amount: 50, // GHS 50
      currency: "GHS",
      payment_options: "card,mobilemoney,banktransfer",
      customer: {
        email: user.email,
        phone_number: "0500000000", // Default phone number
        name: user.email,
      },
      customizations: {
        title: "Mood Journal Premium",
        description: "Upgrade to Premium for advanced features",
        logo: "https://your-logo-url.com/logo.png",
      },
      callback: async function (data: any) {
        console.log("Payment successful:", data);
        
        if (data.status === "successful") {
          try {
            // Verify payment on backend
            const { data: verifyData, error } = await supabase.functions.invoke(
              'verify-payment',
              {
                body: { transaction_id: data.transaction_id }
              }
            );

            if (error) {
              throw error;
            }

            if (verifyData.success) {
              await refreshPremiumStatus();
              toast({
                title: "Payment Successful!",
                description: "Welcome to Premium! You now have access to all premium features.",
              });
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if this issue persists.",
              variant: "destructive",
            });
          }
        }
        setLoading(false);
        modal.close();
      },
      onclose: function () {
        console.log("Payment modal closed");
        setLoading(false);
      },
    });
  };

  if (isPremium) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Crown className="h-5 w-5" />
            Premium Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You have access to all premium features!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Upgrade to Premium
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Premium Features:</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Export journal entries (CSV/PDF)
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Daily motivational quotes
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Advanced streak badges
            </li>
          </ul>
        </div>
        <div className="pt-2">
          <p className="text-lg font-bold mb-2">GHS 50.00</p>
          <Button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Go Premium"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};