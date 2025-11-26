import {takeLatest, put, call} from 'redux-saga/effects';
import {
  getQuoteRequest,
  getQuoteSuccess,
  getQuoteFailure,
} from '../slices/qouteDataSlice';
import {getQuotesAPI} from '../api';

function* handleGetQuote(action) {
  try {
    const {userId, token} = action.payload;
    const quotes = yield call(getQuotesAPI, userId, token);
    yield put(getQuoteSuccess(quotes));
  } catch (error) {
    console.log('@tyty', error);
    yield put(getQuoteFailure(error.message));
  }
}

export default function* getQuoteSaga() {
  yield takeLatest(getQuoteRequest.type, handleGetQuote);
}
