import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { startNetworkLogging } from 'react-native-network-logger';

// Start network logging for all requests
startNetworkLogging();

// https://scrape4you.onrender.com/auth/register
// Set up the base Axios instance
const api = axios.create({
  baseURL: 'https://scrape4you-backend.onrender.com', // Production URL
  timeout: 30000, // Timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
  },
});
export const axiosHeader = token => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};
// Login API
// In your api.ts
export const login = async userData => {
  try {
    console.log('@ DATA SEND IN LOGIN', userData);
    const response = await api.post(
      '/auth/login',
      JSON.stringify({
        email: userData.email,
        password: userData.password,
        deviceId: userData.deviceId,
        fcm_token: userData?.token,
      }),
    );
    console.log('🔍 [API] Login Response:', JSON.stringify(response?.data, null, 2));
    console.log('🔍 [API] Response Keys:', Object.keys(response?.data || {}));
    console.log('🔍 [API] Has access_token?', !!response?.data?.access_token);
    console.log('🔍 [API] Token value:', response?.data?.access_token ? `${response.data.access_token.substring(0, 30)}...` : 'NOT FOUND');

    if (response.data?.message === 'Login successful') {
      return response.data;
    } else {
      console.log('Error ress', response?.data?.message);
      throw new Error(response.data?.message || 'Login failed');
    }
  } catch (error) {
    console.log('❌ [API] Login Error:', error.response?.data || error.message);
    console.log('❌ [API] Error status:', error.response?.status);
    // Re-throw the error so saga can handle it
    throw error;
  }
};
//Atempt login
export const attemptLogin = async userData => {
  try {
    console.log('@USER DATA', userData);
    const response = await api.post(
      '/auth/attemptLogin',
      JSON.stringify({
        email: userData?.email,
        password: userData?.password,
        deviceId: userData?.deviceId,
      }),
    );
    return response.data;
  } catch (error) {
    console.log(
      'Attempt Login API Error:',
      error.response?.data || error.message,
    );
    throw error; // Re-throw the error for saga to handle
  }
};

//Guest Login
export const guestLoginApi = async ({deviceId, fcm_token}) => {
  const response = await api.post('/auth/guest-login', {
    deviceId,
    fcm_token,
  });
  if (response.status === 201) {
    return response.data;
  } else {
    throw new Error(response.data?.message || 'Guest login failed');
  }
};

// Register API
export const register = async userData => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data?.message === 'Registration Successful') {
      return response.data;
    } else {
      console.log('@EROR in REgister', response);
      throw new Error(response.data?.message || 'Registration failed');
    }
  } catch (error) {
    console.log('REGISTER API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};
// get All Car Listing
// Get All Car Listing
export const getUser = async token => {
  const deviceId = await DeviceInfo.getUniqueId();
  try {
    const response = await api.get('/car/get-all-listing', {
      headers: {
        Authorization: `Bearer ${token}`,
        'device-id': deviceId,
        'Content-Type': 'application/json',
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.log('Get User Error:', error.response?.data || error.message); // Log the error
    throw new Error(
      error.response?.data?.message || 'Failed to fetch user data',
    ); // Throw a meaningful error
  }
};
//Get Fav Listings
export const getFavListings = async token => {
  const deviceId = await DeviceInfo.getUniqueId();
  try {
    const response = await api.get('/auth/list-all-saved', {
      headers: {
        Authorization: `Bearer ${token}`,
        'device-id': deviceId,
        'Content-Type': 'application/json',
      },
    });
    return response.data; // Return the data
  } catch (error) {
    console.log('Get User Error:', error.response?.data || error.message); // Log the error
    throw new Error(
      error.response?.data?.message || 'Failed to fetch user data',
    ); // Throw a meaningful error
  }
};
// Get User Details

export const fetchUserDetails = async token => {
  const deviceId = await DeviceInfo.getUniqueId();
  try {
    const response = await api.get('/auth/get-user-details', {
      headers: {
        Authorization: `Bearer ${token}`,
        'device-id': deviceId,
      },
    });

    return response.data; // Return the data
  } catch (error) {
    console.log(
      'Fetch User Details Error:',
      error.response?.data || error.message,
    ); // Log the error
    throw new Error(
      error.response?.data?.message || 'Failed to fetch user details',
    ); // Throw a meaningful error
  }
};
//User Profile Update
export const updateUserProfile = async (token, updatedData) => {
  console.log('@UPDATE DATAA SEND IN API', updatedData);
  try {
    const response = await api.put('/auth/update-user-profile', updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Return the data
  } catch (error) {
    console.log(
      'Update User Profile Error:',
      error.response?.data || error.message,
    ); // Log the error
    throw new Error(
      error.response?.data?.message || 'Failed to update user profile',
    ); // Throw a meaningful error
  }
};
//Add to favourite
export const addToSaved = async (carId, token) => {
  const deviceId = await DeviceInfo.getUniqueId();
  try {
    const response = await api.post(
      `/auth/add-to-saved/${carId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'device-id': deviceId,
        },
      },
    );
    return response.data; // Return the response from the server
  } catch (error) {
    console.log('API Error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to toggle favorite',
    );
  }
};
//Update View count
export const updateViewCount = async (carId, token) => {
  const deviceId = await DeviceInfo.getUniqueId();
  try {
    const response = await api.post(
      `/car/${carId}/view`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'device-id': deviceId,
        },
      },
    );
    return response.data; // Return the response from the server
  } catch (error) {
    console.log('API Error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to update view count',
    );
  }
};

export const checkSubscription = async email => {
  try {
    const response = await api.post('/stripe/check-subscription', {
      email: email,
    });
    // console.log('====================================latest');
    // console.log(response.data?.subscriptions);
    // console.log('====================================');
    if (response.data) {
      return response.data;
    }
    return;
    // throw new Error(response.data?.message || 'Subscription check failed');
  } catch (error) {
    console.log(
      'Check Subscription Error:',
      error.response?.data || error?.message,
    );
    // throw new Error(
    //   error.response?.data?.message || 'Failed to check subscription status',
    // );
    return;
  }
};

export const cancelSubscription = async (subscriptionId, token) => {
  try {
    const response = await api.post(
      '/stripe/cancel-subscription',
      {subscriptionID: subscriptionId},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log(
      'Cancel Subscription Error:',
      error.response?.data || error?.message,
    );
    throw new Error(
      error.response?.data?.message || 'Failed to cancel subscription',
    );
  }
};
// Update Subcription
export const updateSubscription = async (subscription, token) => {
  try {
    const response = await api.put(
      '/auth/update-subscription',
      {
        subscription,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (response?.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.log(
      'Update Subscription Error:',
      error.response?.data || error?.message,
    );
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to update subscription';
    console.log(errorMessage);
    throw new Error(
      error?.response?.data?.message || 'Failed to update subscription',
    );
  }
};

//Send a Qoute
export const sendQuoteAPI = async ({
  listingId,
  userId,
  amount,
  message,
  token,
}) => {
  try {
    const response = await api.post(
      '/quotes/create',
      {
        listingId,
        agentId: userId,
        amount,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log('Quote API Error:', error.response?.data || error?.message);
    throw new Error(error.response?.data?.message || 'Failed to send quote');
  }
};
// Get Data of Quotes
export const getQuotesAPI = async (userId, token) => {
  try {
    const response = await api.get(`/quotes/agent/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log('Get Quotes API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch quotes');
  }
};
export const getNotificationsAPI = async (page = 1, limit = 20, token) => {
  try {
    const response = await api.get(
      `/notifications/list?page=${page}&limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );
    console.log('📬 Notifications Response:', response);
    return response.data;
  } catch (error) {
    console.log('Get Notifications API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

export default api;
