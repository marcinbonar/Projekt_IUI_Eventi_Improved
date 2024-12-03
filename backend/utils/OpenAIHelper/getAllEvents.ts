import { EventData } from '../../models/events';

export async function getAllEvents() {
  return EventData.find();
}
