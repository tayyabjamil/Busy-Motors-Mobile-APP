import {takeLatest, put, call} from 'redux-saga/effects';

import {addToSaved} from '../api';
import {
  toggleFavoriteFailure,
  toggleFavoriteRequest,
  toggleFavoriteSuccess,
} from '../slices/favouriteSlice';

// Worker saga for toggling favorite
function* handleToggleFavorite(action) {
  try {
    const {carId, token} = action.payload;
    const response = yield call(addToSaved, carId, token); // Call the API
    yield put(toggleFavoriteSuccess(response.favorites)); // Update the state with the new favorites list
  } catch (error) {
    yield put(
      toggleFavoriteFailure(error.message || 'Failed to toggle favorite'),
    ); // Dispatch failure action
  }
}

// Watcher saga
export default function* favoritesSaga() {
  yield takeLatest(toggleFavoriteRequest.type, handleToggleFavorite); // Watch for toggle favorite actions
}
