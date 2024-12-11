export const baseUrl = 'http://localhost:4000/';
export const USER = {
  REGISTRATION: '/auth/register',
  LOGIN: '/auth/login',
  CHANGE_PASSWORD: (userId: string) => `/auth/user/changePassword/${userId}`,
  LOGIN_USER_BY_GOOGLE: '/auth/googleLogin',
  GET_ALL_USER: '/user/all',
  BLOCK_USER: '/user/blockUser',
  UNBLOCK_USER: '/user/unblockUser',
  USER_EVENTS: (userId: string) => `/event/userEvents/${userId}`,
  ALL_USERS_EVENTS: '/event/usersWithEvents',
  GET_USER: (id: string) => `/user/${id}`,
};

export const EVENT = {
  GET_ALL_EVENTS: '/event/all',
  GET_ALL_ADMIN_EVENTS: '/event/all',
  ADD_EVENT: '/event/add-event',
  DELETE_EVENT: (eventId: string) => `/event/delete-event/${eventId}`,
  SIGN_UP_TO_EVENT: (userId: string, eventId: string) => `event/signUp/${userId}/${eventId}`,
  BUY_TICKET_STRIPE: (userId: string, eventId: string, stripeToken: string) =>
    `/event/${eventId}/buy-ticket/stripe/${userId}/${stripeToken}`,
  GET_RECOMMENDATIONS: (userId: string) => `/event/${userId}/getRecommendations`,
  BUY_TICKET_OFFLINE: (eventId: string, userId: string) =>
    `/event/${eventId}/buy-ticket/offline/${userId}`,
  GET_SOLID_TICKETS_FOR_EVENTS: '/event/solidTicketForEvents',
  GET_EVENT_BY_ID: '/event/{id}',
};
