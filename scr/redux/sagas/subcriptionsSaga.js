import {takeLatest} from 'redux-saga/effects';
import {checkSubscriptionRequest} from '../slices/subcriptionsSlice';

function* handleCheckSubscription() {
  // Subscriptions are handled via RevenueCat — no backend call needed
}

export default function* subscriptionSaga() {
  yield takeLatest(checkSubscriptionRequest.type, handleCheckSubscription);
}
