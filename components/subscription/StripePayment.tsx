import React from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface StripePaymentProps {
  amount: number;
  description: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripePayment: React.FC<StripePaymentProps> = ({amount, description, onSuccess, onError}) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm amount={amount} description={description} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
};

export default StripePayment;
