import mongoose from 'mongoose';
import { ROLES } from '../constants/constants';

export interface User {
  userId: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  isBlocked: boolean;
  role: typeof ROLES.USER | typeof ROLES.ADMIN;
  tickets: [{ type: mongoose.Schema.Types.ObjectId; ref: 'TicketData' }];
}

export const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    surname: {
      type: String,
      required: [true, 'alert_required'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'alert_required'],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: [ROLES.USER, ROLES.ADMIN],
      default: ROLES.USER,
    },
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TicketData',
      },
    ],
  },
  { collection: 'users' }
);

export const UserData = mongoose.model('UserData', userSchema);
