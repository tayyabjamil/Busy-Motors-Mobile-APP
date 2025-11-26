import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  subscriptionData: null,
  error: null,
  cancelLoading: false,
  cancelError: null,
  cancelSuccess: false,
};

const cancelSubscriptionSlice = createSlice({
  name: 'cancelSubscription',
  initialState,
  reducers: {
    cancelSubscriptionRequest: (state) => {
      state.cancelLoading = true;
      state.cancelError = null;
      state.cancelSuccess = false;
    },
    cancelSubscriptionSuccess: (state, action) => {
      state.cancelLoading = false;
      state.cancelSuccess = true;
      state.subscriptionData = action.payload;
    },
    cancelSubscriptionFailure: (state, action) => {
      state.cancelLoading = false;
      state.cancelError = action.payload;
    },
    resetCancelStatus: (state) => {
      state.cancelLoading = false;
      state.cancelError = null;
      state.cancelSuccess = false;
    }
  },
});

export const {
  cancelSubscriptionRequest,
  cancelSubscriptionSuccess,
  cancelSubscriptionFailure,
  resetCancelStatus,
} = cancelSubscriptionSlice.actions;

export default cancelSubscriptionSlice.reducer;
