import { UserData } from '../../models/users';

export async function getUserWithTicketsAndEvents(userId: string) {
  return UserData.findById(userId).populate({
    path: 'tickets',
    populate: {
      path: 'event',
    },
  });
}
