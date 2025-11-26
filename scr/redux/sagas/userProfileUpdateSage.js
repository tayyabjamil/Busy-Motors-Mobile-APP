// profileUpdateSaga.js
import { takeLatest, put, call } from 'redux-saga/effects';
import {
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
} from '../slices/userProfileUpdateSlice';
import { updateUserProfile } from '../api'; // Import the API function

// Worker saga for updating user profile
function* handleUpdateProfile(action) {
  try {
    const { token, updatedData } = action.payload;
    const response = yield call(updateUserProfile, token, updatedData); // Call the API
    console.log('@responce',response)
    yield put(updateProfileSuccess(response)); // Dispatch success action
  } catch (error) {
    console.error('Error updating profile:', error);
    yield put(updateProfileFailure(error.message || 'Failed to update profile')); // Dispatch failure action
  }
}

// Watcher saga
export default function* profileUpdateSaga() {
  yield takeLatest(updateProfileRequest.type, handleUpdateProfile);
}