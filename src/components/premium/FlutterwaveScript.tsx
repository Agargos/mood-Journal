import { useEffect } from 'react';

export const FlutterwaveScript = () => {
  useEffect(() => {
    // Load Flutterwave script if not already loaded
    if (!window.FlutterwaveCheckout) {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  return null;
};