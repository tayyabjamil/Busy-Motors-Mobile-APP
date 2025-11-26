import { takeLatest, put, call } from 'redux-saga/effects';
import { getUser } from '../api'; // Import API function
import { getUserRequest, getUserSuccess, getUserFailure } from '../slices/carListingsSlice';

// Worker saga for fetching user
function* handleGetUser(action) {
  try {
    const response = yield call(getUser, action.payload);
    // console.log('@RESPOCNE',response)
    yield put(getUserSuccess(response));
  } catch (error) {
    console.error('Error fetching user:', error);
    yield put(getUserFailure(error.message || 'Failed to fetch user'));
  }
}

// Watcher saga
export default function* userSaga() {
  yield takeLatest(getUserRequest.type, handleGetUser); 
}
