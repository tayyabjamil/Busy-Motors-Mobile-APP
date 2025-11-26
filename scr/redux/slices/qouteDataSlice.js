import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  quotes: [],
  error: null,
};

const getQuoteDataSlice = createSlice({
  name: 'getQuote',
  initialState,
  reducers: {
    getQuoteRequest: state => {
      state.loading = true;
      state.error = null;
    },
    getQuoteSuccess: (state, action) => {
      state.loading = false;
      state.quotes = action.payload;
    },
    getQuoteFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetQuote: state => {
      state.quotes = [];
      state.error = null;
    },
  },
});

// Fixed the export (was getQuoteData.actions)
export const {getQuoteRequest, getQuoteSuccess, getQuoteFailure, resetQuote} =
  getQuoteDataSlice.actions;

export default getQuoteDataSlice.reducer;
