// store.js
import {configureStore, combineReducers} from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import userDetail from './slices/userDetail';
import carListingsReducer from './slices/carListingsSlice';
import userProfileUpdateReducer from './slices/userProfileUpdateSlice';
import favoritesReducer from './slices/favouriteSlice';
import favListingsReducer from './slices/favouriteListingSlice';

import getQuoteDataReducer from './slices/qouteDataSlice';
import getQuoteSaga from './sagas/qouteDataSaga';

import qouteReducer from './slices/qouteSlice';
import quoteSaga from './sagas/qouteSaga';

import notificationsReducer from './slices/notificationsSlice';

import viewCountReducer from './slices/viewCount';
import subscriptionReducer from './slices/subcriptionsSlice';
import subscriptionSaga from './sagas/subcriptionsSaga';
import authSaga from './sagas/authSaga';
import userSaga from './sagas/carListingsSaga';
import userDetailSaga from './sagas/userDetailSaga';
import userProfileUpdateSage from './sagas/userProfileUpdateSage';
import favouriteSaga from './sagas/favouriteSaga';
import favListingsSaga from './sagas/favListingsSaga';
import viewCountSaga from './sagas/viewCountSaga';
const sagaMiddleware = createSagaMiddleware();

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [
    'auth',
    'carListings',
    'user',
    'profileUpdate',
    'favourite',
    'favListings',
    'viewCount',
    'qoute',
    'getQuoteData',
  ],
};

const rootReducer = combineReducers({
  auth: authReducer,
  carListings: carListingsReducer,
  user: userDetail,
  profileUpdate: userProfileUpdateReducer,
  favourite: favoritesReducer,
  favListings: favListingsReducer,
  viewCount: viewCountReducer,
  quote: qouteReducer,
  quoteData: getQuoteDataReducer,
  notifications: notificationsReducer,
  subscription: subscriptionReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

const persistor = persistStore(store);

sagaMiddleware.run(authSaga);
sagaMiddleware.run(userSaga);
sagaMiddleware.run(userDetailSaga);
sagaMiddleware.run(userProfileUpdateSage);
sagaMiddleware.run(favouriteSaga);
sagaMiddleware.run(favListingsSaga);
sagaMiddleware.run(viewCountSaga);
sagaMiddleware.run(quoteSaga);
sagaMiddleware.run(getQuoteSaga);
sagaMiddleware.run(subscriptionSaga);

export {store, persistor};
