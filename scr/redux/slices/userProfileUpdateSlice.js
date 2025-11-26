// profileUpdateSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  success: false,
  error: null,
  message: null, // Add a message field to store the response message
};

const userProfileUpdateSlice = createSlice({
  name: 'profileUpdate',
  initialState,
  reducers: {
    updateProfileRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
      state.message = null; // Reset message on request
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.message = action.payload.message; // Store the response message
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.message = null; // Reset message on failure
    },
    resetProfileUpdateState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = null; // Reset message on state reset
    },
  },
});

export const {
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  resetProfileUpdateState,
} = userProfileUpdateSlice.actions;

export default userProfileUpdateSlice.reducer;