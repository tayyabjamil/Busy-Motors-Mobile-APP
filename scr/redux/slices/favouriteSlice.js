import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  favoriteItems: [], // Array to store favorite car IDs
};

const favouriteSlice = createSlice({
  name: 'favourite',
  initialState,
  reducers: {
    // Action to toggle favorite status
    toggleFavoriteRequest: state => {
      state.loading = true;
      state.error = null;
    },
    toggleFavoriteSuccess: (state, action) => {
      state.loading = false;
      state.favoriteItems = action.payload; // Update the favorite list
    },
    toggleFavoriteFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  toggleFavoriteRequest,
  toggleFavoriteSuccess,
  toggleFavoriteFailure,
} = favouriteSlice.actions;

export default favouriteSlice.reducer;
