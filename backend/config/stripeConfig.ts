import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.join(__dirname, './.env') });

class StripeConfig {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Klucz STRIPE_SECRET_KEY nie jest ustawiony w zmiennych środowiskowych');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: null,
    });
  }

  public async charge(token: string, amount: number) {
    try {
      const charge = await this.stripe.charges.create({
        amount: Math.round(amount * 100),
        currency: 'PLN',
        description: 'Opłata za bilet',
        source: token,
      });
      return charge;
    } catch (error) {
      console.error('Błąd podczas przetwarzania płatności Stripe:', error);
      throw new Error('Błąd podczas przetwarzania płatności Stripe');
    }
  }
}

export default new StripeConfig();
