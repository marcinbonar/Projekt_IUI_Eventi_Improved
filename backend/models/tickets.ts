import mongoose from 'mongoose';
import { User } from './users';

export interface Ticket {
  ticketId: string;
  event: mongoose.Types.ObjectId | Event;
  user: mongoose.Types.ObjectId | User;
  paymentStatus: 'PAID_ONLINE' | 'PAID_OFFLINE' | 'PENDING_OFFLINE_PAYMENT';
}

export const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventData',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserData',
    },
    paymentStatus: {
      type: String,
      enum: ['PAID_ONLINE', 'PAID_OFFLINE', 'PENDING_OFFLINE_PAYMENT'],
      required: true,
    },
  },
  { collection: 'tickets' }
);

export const TicketData = mongoose.model<Ticket>('TicketData', ticketSchema);
