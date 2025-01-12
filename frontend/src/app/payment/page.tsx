'use client';

import React, { Suspense } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import NavBar from "@/app/section/navbar";
import Footer from "@/app/section/footer";
import { Loader2 } from 'lucide-react';

// Stripe configuration
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Import PaymentForm component
import { PaymentForm } from '@/app/payment/PaymentForm';

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
    <span className="ml-2">Chargement...</span>
  </div>
);

const StripePaymentPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <Elements stripe={stripePromise}>
        <Suspense fallback={<LoadingFallback />}>
          <PaymentForm />
        </Suspense>
      </Elements>
      <Footer />
    </div>
  );
};

export default StripePaymentPage;