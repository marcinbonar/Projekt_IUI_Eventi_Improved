import { OAuth2Client } from 'google-auth-library';

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export enum PAYMENT_STATUS {
  PAID_ONLINE,
  PAID_OFFLINE,
  PENDING_OFFLINE_PAYMENT,
}

export const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
