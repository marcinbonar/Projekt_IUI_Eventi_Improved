import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: string;
  name: string;
  surname: string;
  email: string;
  role: string;
}

interface UserState {
  userId: string | null;
  userDetails: {
    name: string | null;
    email: string | null;
    surname: string | null;
    role: string | null;
  } | null;
}

const token = sessionStorage.getItem('authorization');

let userId: string | null = null;
let userDetails: UserState['userDetails'] = null;

if (token) {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    userId = decoded?.userId ?? null;
    userDetails = {
      name: decoded?.name ?? null,
      surname: decoded?.surname ?? null,
      email: decoded?.email ?? null,
      role: decoded?.role ?? null,
    };
  } catch (error) {
    console.error('Error decoding token:', error);
  }
}

const initialState: UserState = {
  userId,
  userDetails,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    setUserDetails: (state, action: PayloadAction<UserState['userDetails']>) => {
      state.userDetails = action.payload;
    },
    clearUserId: state => {
      state.userId = null;
      state.userDetails = null;
    },
  },
});

export const { setUserId, setUserDetails, clearUserId } = userSlice.actions;

export default userSlice.reducer;
