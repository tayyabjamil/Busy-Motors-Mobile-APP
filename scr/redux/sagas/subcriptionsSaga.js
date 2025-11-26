// Create a new file subscriptionSaga.js
import {takeLatest, put, call} from 'redux-saga/effects';
import {
  checkSubscriptionRequest,
  checkSubscriptionSuccess,
  checkSubscriptionFailure,
} from '../slices/subcriptionsSlice';
import {checkSubscription} from '../api';

// Worker saga for checking subscription
function* handleCheckSubscription(action) {
  try {
    const response = yield call(checkSubscription, action.payload.email);
    yield put(checkSubscriptionSuccess(response));
  } catch (error) {
    console.log('@error in subscription saga', error);
    yield put(checkSubscriptionFailure(error || 'Subscription check failed'));
  }
}

// Watcher saga
export default function* subscriptionSaga() {
  yield takeLatest(checkSubscriptionRequest.type, handleCheckSubscription);
}
