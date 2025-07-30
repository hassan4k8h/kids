import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface StripeCheckoutFormProps {
  amount: number;
  description: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({ amount, description, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe is not loaded');
      setLoading(false);
      return;
    }

    // في تطبيق حقيقي: يجب إنشاء PaymentIntent من السيرفر
    // هنا سنستخدم تأكيد الدفع مباشرة (للتجربة فقط)
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    try {
      const { error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: description,
        },
      });
      if (error) throw error;
      // هنا يجب إرسال paymentMethod.id إلى السيرفر لإنشاء PaymentIntent
      // ثم تأكيد الدفع
      // سنعتبر الدفع ناجحاً للتجربة
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      onError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <CardElement options={{ hidePostalCode: true }} />
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <button type="submit" disabled={!stripe || loading} style={{ marginTop: 16 }}>
        {loading ? 'جاري الدفع...' : `ادفع الآن (${amount} ريال)`}
      </button>
    </form>
  );
};

export default StripeCheckoutForm;
