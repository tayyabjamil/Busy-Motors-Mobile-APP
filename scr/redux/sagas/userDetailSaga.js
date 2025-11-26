// userSaga.js
import {takeLatest, put, call} from 'redux-saga/effects';
import {
  fetchUserRequest,
  fetchUserSuccess,
  fetchUserFailure,
} from '../slices/userDetail';
import {fetchUserDetails} from '../api'; // Import the API function

// Worker saga for fetching user details
function* handleFetchUser(action) {
  try {
    const response = yield call(fetchUserDetails, action.payload); // Pass the token
    yield put(fetchUserSuccess(response));
  } catch (error) {
    console.log('Error fetching user details:', error);
    yield put(
      fetchUserFailure(error.message || 'Failed to fetch user details'),
    );
  }
}

// Watcher saga
export default function* userDetailSaga() {
  yield takeLatest(fetchUserRequest.type, handleFetchUser);
}
