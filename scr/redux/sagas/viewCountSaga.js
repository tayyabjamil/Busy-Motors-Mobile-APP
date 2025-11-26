// sagas/viewCountSaga.js
import { takeLatest, put, call } from 'redux-saga/effects';
import { updateViewCount } from '../api';
import {
  updateViewCountRequest,
  updateViewCountSuccess,
  updateViewCountFailure,
} from '../slices/viewCount';

function* handleUpdateViewCount(action) {
  try {
    const { carId, token } = action.payload;
    const response =   yield call(updateViewCount, carId, token); // Call the API
    yield put(updateViewCountSuccess(response)); // Dispatch success action
  } catch (error) {
    yield put(updateViewCountFailure(error.message || 'Failed to update view count')); // Dispatch failure action
  }
}

export default function* viewCountSaga() {
  yield takeLatest(updateViewCountRequest.type, handleUpdateViewCount); // Watch for update view count actions
}