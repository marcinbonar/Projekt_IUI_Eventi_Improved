import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface UserState {
  userId: string | null;
  userDetails: {
    name: string | null;
    surname: string | null;
    role: string | null;
  } | null;
}

const initialState: UserState = {
  userId: sessionStorage.getItem('userId') ?? null,
  userDetails: JSON.parse(sessionStorage.getItem('userDetails') || 'null'),
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
    clearUserId: (state) => {
      state.userId = null;
      state.userDetails = null;
    },
  },
});

export const { setUserId, setUserDetails, clearUserId } = userSlice.actions;

export default userSlice.reducer;
