import mongoose from 'mongoose';

export interface Event {
  eventId: string;
  title: string;
  description?: string;
  image?: string;
  startDate: Date;
  endDate: Date;
  location: string;
  category: string;
  availableTickets: number;
  soldTickets: number;
  ticketPrice: number;
  attendees: mongoose.Types.ObjectId[];
}

export const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'alert_required'],
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: [true, 'alert_required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'alert_required'],
    },
    availableTickets: {
      type: Number,
      required: true,
    },
    soldTickets: {
      type: Number,
      default: 0,
    },
    ticketPrice: {
      type: Number,
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserData',
      },
    ],
  },
  { collection: 'events' }
);

export const EventData = mongoose.model<Event>('EventData', eventSchema);
