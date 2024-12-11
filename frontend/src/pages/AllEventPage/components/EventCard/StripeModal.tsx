import React, { FC } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(
  'pk_test_51N48GjIsbYzyASTLCnvqhAqfb85hsbG7OU7kuWsXXOi8lH7dPfRZ8j1yGqev2pl9PMFAh4FPEFoJOCaif0qAPE5v00Fsvil10c'
);

interface StripeModalProps {
  isModalVisible: boolean;
  eventId?: string;
  userId?: string | null;
  closeModal: () => void;
}

const StripeModal: FC<StripeModalProps> = ({ isModalVisible, eventId, userId, closeModal }) => {
  if (!isModalVisible) return null;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm eventId={eventId} userId={userId} closeStripeModal={closeModal} />
    </Elements>
  );
};

export default StripeModal;
