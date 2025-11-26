import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  updateSubscriptionData: null,
  error: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
};

const updateSubscriptionSlice = createSlice({
  name: 'updateSubscription',
  initialState,
  reducers: {
    updateSubscriptionRequest: state => {
      state.updateLoading = true;
      state.updateError = null;
      state.updateSuccess = false;
    },
    updateSubscriptionSuccess: (state, action) => {
      state.updateLoading = false;
      state.updateSuccess = true;
      state.updateSubscriptionData = action.payload;
    },
    updateSubscriptionFailure: (state, action) => {
      state.updateLoading = false;
      state.updateError = action.payload;
    },
    resetUpdateStatus: state => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
  },
});

export const {
  updateSubscriptionRequest,
  updateSubscriptionSuccess,
  updateSubscriptionFailure,
  resetUpdateStatus,
} = updateSubscriptionSlice.actions;

export default updateSubscriptionSlice.reducer;
