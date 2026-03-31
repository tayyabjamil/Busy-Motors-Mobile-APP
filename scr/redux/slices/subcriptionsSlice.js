import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  subscriptionData: null,
  error: null,
  response: null,
  activeSubscriptions: [],
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    checkSubscriptionRequest: (state, action) => {
      state.loading = true;
      state.response = null;
      state.error = null;
    },
    checkSubscriptionSuccess: (state, action) => {
      state.loading = false;
      state.subscriptionData = action.payload;
      state.response = {
        success: true,
        message: action.payload.message,
      };
    },
    checkSubscriptionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.response = {
        success: false,
        error: action.payload,
      };
    },
    setActiveSubscriptions: (state, action) => {
      state.activeSubscriptions = action.payload;
    },
    updateActiveSubscriptions: (state, action) => {
      state.activeSubscriptions = action.payload;
    },
    resetSubscriptionResponse: state => {
      state.response = null;
    },
  },
});

export const {
  checkSubscriptionRequest,
  checkSubscriptionSuccess,
  checkSubscriptionFailure,
  setActiveSubscriptions,
  updateActiveSubscriptions,
  resetSubscriptionResponse,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
