import { takeLatest, put, call } from 'redux-saga/effects';

import { cancelSubscriptionFailure, cancelSubscriptionRequest, cancelSubscriptionSuccess } from '../slices/canceleSubcriptionsSlice';
import { cancelSubscription } from '../api';

function* handleCancelSubscription(action) {
  try {
    const { subscriptionId, token } = action.payload;
    const response = yield call(cancelSubscription, subscriptionId, token);
    yield put(cancelSubscriptionSuccess(response.data));
  } catch (error) {
    console.log('Error canceling subscription:', error);
    yield put(cancelSubscriptionFailure(error.message));
  }
}

export default function* cancelSubscriptionSaga() {
  yield takeLatest(cancelSubscriptionRequest.type, handleCancelSubscription);
}
