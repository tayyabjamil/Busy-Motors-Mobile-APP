import {takeLatest, put, call} from 'redux-saga/effects';
import Geolocation from 'react-native-geolocation-service';
import {attemptLogin, guestLoginApi, login, register, updateLocationAPI} from '../api'; // Import the APIs
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  guestLoginRequest,
  guestLoginSuccess,
  guestLoginFailure,
} from '../slices/authSlice'; // Import actions from authSlice
import {checkSubscriptionRequest} from '../slices/subcriptionsSlice';

const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(position.coords),
      error => reject(error),
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 60000},
    );
  });

// Worker saga for login
function* handleLogin(action) {
  try {
    console.log('🔐 [authSaga] handleLogin started');
    console.log('🔐 [authSaga] Login payload:', JSON.stringify(action.payload, null, 2));

    // Only call attemptLogin if this is NOT a confirmed attempt
    // if (!action.payload.isConfirmed) {
    //   const attemptResponse = yield call(attemptLogin, action.payload);

    //   if (attemptResponse.requires_confirmation) {
    //     yield put(loginSuccess(attemptResponse));
    //     return; // Exit early since we're showing confirmation modal
    //   }
    // }

    // Proceed with normal login (either no confirmation needed or this is a confirmed attempt)
    const loginResponse = yield call(login, action.payload);
    console.log('✅ [authSaga] Login API response:', JSON.stringify(loginResponse, null, 2));

    yield put(loginSuccess(loginResponse));
    console.log('✅ [authSaga] loginSuccess action dispatched');

    // Get location and update after successful login
    try {
      const coords = yield call(getCurrentLocation);
      yield call(updateLocationAPI, coords.latitude, coords.longitude);
      console.log('📍 [authSaga] Location updated:', coords.latitude, coords.longitude);
    } catch (locError) {
      console.log('📍 [authSaga] Location update skipped:', locError.message);
    }

    // yield put(checkSubscriptionRequest({email: action.payload.email}));
  } catch (error) {
    console.log('❌ [authSaga] Login error:', error);
    console.log('❌ [authSaga] Error response:', error.response?.data);
    yield put(
      loginFailure(
        error.response?.data?.message || error.message || 'Login failed',
      ),
    );
  }
}

function* handleGuestLogin(action) {
  try {
    console.log('👤 [authSaga] Guest login started');
    console.log('👤 [authSaga] Guest payload:', JSON.stringify(action.payload, null, 2));

    const response = yield call(guestLoginApi, action.payload);
    console.log('✅ [authSaga] Guest login API response:', JSON.stringify(response, null, 2));

    yield put(guestLoginSuccess(response));
    console.log('✅ [authSaga] guestLoginSuccess action dispatched');
  } catch (error) {
    console.log('❌ [authSaga] Guest login error:', error);
    console.log('❌ [authSaga] Error response:', error.response?.data);
    yield put(
      guestLoginFailure(
        error.response?.data?.message || error.message || 'Guest login failed',
      ),
    );
  }
}
// Worker saga for register
function* handleRegister(action) {
  try {
    const response = yield call(register, action.payload);
    yield put(registerSuccess(response));
  } catch (error) {
    console.log('@EERRR', error);
    yield put(registerFailure(error.message || 'Registration failed'));
  }
}

// Watcher saga
export default function* authSaga() {
  yield takeLatest(guestLoginRequest.type, handleGuestLogin);
  yield takeLatest(loginRequest.type, handleLogin); // Watch for login actions
  yield takeLatest(registerRequest.type, handleRegister); // Watch for register actions
}
