import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const favListings = createSlice({
  name: 'favListings',
  initialState,
  reducers: {
    getFavListingsRequest: state => {
      state.loading = true;
      state.error = null;
    },
    getFavListingsSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload;
    },
    getFavListingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { getFavListingsRequest, getFavListingsSuccess, getFavListingsFailure } = favListings.actions;

export default favListings.reducer;
