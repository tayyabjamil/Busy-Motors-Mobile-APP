import {takeLatest, put, call} from 'redux-saga/effects';
import {
  sendQuoteFailure,
  sendQuoteRequest,
  sendQuoteSuccess,
} from '../slices/qouteSlice';
import {sendQuoteAPI} from '../api';

// In your saga file
function* handleGetQuote(action) {
  try {
    const {listingId, userId, token, amount, message} = action.payload;

    const quotes = yield call(sendQuoteAPI, {
      listingId,
      userId,
      amount,
      message,
      token,
    });

    yield put(sendQuoteSuccess(quotes));
  } catch (error) {
    yield put(sendQuoteFailure(error.message));
  }
}

export default function* quoteSaga() {
  yield takeLatest(sendQuoteRequest.type, handleGetQuote); // Updated action
}
