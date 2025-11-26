import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const carListings = createSlice({
  name: 'carListings',
  initialState,
  reducers: {
    getUserRequest: state => {
      state.loading = true;
      state.error = null;
    },
    getUserSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload;
    },
    getUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { getUserRequest, getUserSuccess, getUserFailure } = carListings.actions;

export default carListings.reducer;
