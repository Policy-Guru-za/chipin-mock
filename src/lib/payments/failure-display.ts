export type FailureDisplay = {
  heading: string;
  message: string;
  explanations: string[];
};

export function getFailureDisplay(reason?: string): FailureDisplay {
  switch (reason) {
    case 'declined':
      return {
        heading: "Payment Didn't Go Through",
        message: 'Your card was declined. Please check your details or try a different card.',
        explanations: ['Card details were incorrect', 'Card was declined by your bank'],
      };
    case 'insufficient_funds':
      return {
        heading: "Payment Didn't Go Through",
        message: "It looks like there weren't enough funds. Please try a different card or payment method.",
        explanations: ['Insufficient funds'],
      };
    case 'network_error':
      return {
        heading: 'Connection Issue',
        message: 'We lost connection during payment. No funds were taken. Please try again.',
        explanations: ['Connection interrupted'],
      };
    case 'invalid_card':
      return {
        heading: 'Card Details Invalid',
        message: "The card details entered aren't valid. Please check and try again.",
        explanations: [
          'Card number is incorrect',
          'Expiry date is in the past',
          'CVV/security code is incorrect',
        ],
      };
    case 'timeout':
      return {
        heading: 'Payment Timeout',
        message: 'Payment took too long to process. Your card was not charged. Please try again.',
        explanations: ['Connection timed out'],
      };
    case 'user_cancelled':
      return {
        heading: 'Payment Cancelled',
        message: 'You cancelled the payment. No funds were taken. Ready to try again?',
        explanations: [],
      };
    default:
      return {
        heading: "Payment Didn't Go Through",
        message: "Hmm, your payment didn't go through. Please check your card details and try again. 💳",
        explanations: [
          'Card details were incorrect',
          'Insufficient funds',
          'Card was declined by your bank',
          'Connection issue',
        ],
      };
  }
}
