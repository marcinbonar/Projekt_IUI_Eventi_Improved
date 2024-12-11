export interface Event {
  eventId?: string;
  _id?: string;
  title: string;
  paymentStatus: string;
}

export interface UserWithEvents {
  role: string;
  userId?: string;
  _id?: string;
  email: string;
  events: Event[];
}
