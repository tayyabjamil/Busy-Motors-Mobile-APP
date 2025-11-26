import { takeLatest, put, call } from 'redux-saga/effects';
import { getFavListings } from '../api'; // Import API function
import {  getFavListingsFailure, getFavListingsRequest, getFavListingsSuccess,  } from '../slices/favouriteListingSlice';

// Worker saga for fetching user
function* handleGetFavListings(action) {
  try {
    const response = yield call(getFavListings, action.payload);
    yield put(getFavListingsSuccess(response));
  } catch (error) {
    console.error('Error fetching user:', error);
    yield put(getFavListingsFailure(error.message || 'Failed to fetch user'));
  }
}

// Watcher saga
export default function* favListingsSaga() {
  yield takeLatest(getFavListingsRequest.type, handleGetFavListings); 
}
