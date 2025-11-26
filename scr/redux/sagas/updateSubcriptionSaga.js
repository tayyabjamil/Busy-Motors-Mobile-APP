import {takeLatest, put, call} from 'redux-saga/effects';
import {
  updateSubscriptionFailure,
  updateSubscriptionRequest,
  updateSubscriptionSuccess,
} from '../slices/updateSubcriptionSlice';
import {updateSubscription} from '../api';

function* handleUpdateSubscription(action) {
  try {
    const {subcription, token} = action.payload;
    const response = yield call(updateSubscription, subcription, token);
    yield put(updateSubscriptionSuccess(response.message));
  } catch (error) {
    console.log('Error updating subscription:', error);
    yield put(updateSubscriptionFailure(error.message));
  }
}

export default function* updateSubscriptionSaga() {
  yield takeLatest(updateSubscriptionRequest.type, handleUpdateSubscription);
}
