// slices/quoteSlice.js
import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  success: false,
  quoteData: null,
};

const quoteSlice = createSlice({
  name: 'quote',
  initialState,
  reducers: {
    sendQuoteRequest: state => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    sendQuoteSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.quoteData = action.payload;
    },
    sendQuoteFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetQuoteState: state => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
});

export const {
  sendQuoteRequest,
  sendQuoteSuccess,
  sendQuoteFailure,
  resetQuoteState,
} = quoteSlice.actions;

export default quoteSlice.reducer;
