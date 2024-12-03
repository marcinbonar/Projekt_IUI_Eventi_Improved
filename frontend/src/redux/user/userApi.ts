import { USER } from '../../api/constants';
import { UserWithEvents } from '../../types/UserWithEventsResponse';
import { IEvent } from '../../types/event';
import { User } from '../../types/user';
import { apiSlice } from '../api';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: (id: string) => ({
        url: USER.GET_USER(id),
        headers: {
          authorization: `Bearer ${sessionStorage.getItem('authorization')}`,
        },
      }),
    }),
    getUserSignedUpEvents: builder.query<IEvent[], string>({
      query: (userId: string) => ({
        url: `${USER.USER_EVENTS(userId)}`,
        headers: {
          authorization: `Bearer ${sessionStorage.getItem('authorization')}`,
        },
      }),
    }),
    changePassword: builder.mutation<
      void,
      { oldPassword: string; newPassword: string; userId: string }
    >({
      query: ({ oldPassword, newPassword, userId }) => ({
        url: USER.CHANGE_PASSWORD(userId),
        method: 'PUT',
        headers: {
          authorization: `Bearer ${sessionStorage.getItem('authorization')}`,
        },
        body: { oldPassword, newPassword },
      }),
    }),
    loginUser: builder.mutation<User, { email: string; password: string }>({
      query: (credentials) => ({
        url: USER.LOGIN,
        method: 'POST',
        body: credentials,
      }),
    }),
    registerUser: builder.mutation<
      User,
      Pick<User, 'name' | 'surname' | 'email' | 'password'>
    >({
      query: (data) => ({
        url: USER.REGISTRATION,
        method: 'POST',
        body: data,
      }),
    }),
    getAllUsers: builder.query<User[], void>({
      query: () => ({
        url: USER.GET_ALL_USER,
        headers: {
          authorization: `Bearer ${sessionStorage.getItem('authorization')}`,
        },
      }),
    }),
    blockUser: builder.mutation<void, string>({
      query: (email) => ({
        url: USER.BLOCK_USER,
        method: 'POST',
        headers: {
          authorization: `Bearer ${sessionStorage.getItem('authorization')}`,
        },
        body: { email },
      }),
    }),
    unblockUser: builder.mutation<void, string>({
      query: (email) => ({
        url: USER.UNBLOCK_USER,
        method: 'POST',
        headers: {
          authorization: `Bearer ${sessionStorage.getItem('authorization')}`,
        },
        body: { email },
      }),
    }),
    getAllUsersEvents: builder.query<UserWithEvents[], void>({
      query: () => ({
        url: USER.ALL_USERS_EVENTS,
        headers: {
          authorization: `Bearer ${sessionStorage.getItem('authorization')}`,
        },
      }),
    }),
    loginUserByGoogle: builder.mutation<User, { idToken: string }>({
      query: (data) => ({
        url: USER.LOGIN_USER_BY_GOOGLE,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useChangePasswordMutation,
  useLoginUserMutation,
  useRegisterUserMutation,
  useGetUserSignedUpEventsQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetAllUsersEventsQuery,
  useLoginUserByGoogleMutation,
} = userApi;
