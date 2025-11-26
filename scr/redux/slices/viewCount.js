// slices/viewCountSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
};

const viewCountSlice = createSlice({
  name: 'viewCount',
  initialState,
  reducers: {
    updateViewCountRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateViewCountSuccess: (state,action) => {
      state.loading = false;
    },
    updateViewCountFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  updateViewCountRequest,
  updateViewCountSuccess,
  updateViewCountFailure,
} = viewCountSlice.actions;

export default viewCountSlice.reducer;