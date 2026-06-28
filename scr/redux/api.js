import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { startNetworkLogging } from 'react-native-network-logger';
import Config from 'react-native-config';

// Start network logging for all requests
startNetworkLogging();

// Set up the base Axios instance
const api = axios.create({
  baseURL: Config.API_URL,
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
        phone: userData.phone,
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
    if (error.response?.status === 401 || error.response?.data?.message === 'Invalid credentials') {
      throw new Error('Invalid email or password');
    }
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
        phone: userData?.phone,
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
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
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

// Stripe endpoints removed - using RevenueCat for subscriptions

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

// Get Notifications List with Pagination
const NOTIFICATIONS_BASE_URL = Config.API_BASE_URL;

export const getNotificationsAPI = async (page = 1, limit = 20, token) => {
  console.log('🔍 [API] NOTIFICATIONS_BASE_URL', `${NOTIFICATIONS_BASE_URL}/notifications/list?page=${page}&limit=${limit}`);
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
    return response.data;
  } catch (error) {
    console.log('Get Notifications API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

export const saveSubscriptionAPI = async (token, subscriptionData) => {
  try {
    const response = await api.post('/auth/save-subscription', subscriptionData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log('Save Subscription API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to save subscription');
  }
};

export const reportProblemAPI = async ({name, email, text}) => {
  console.log("Api working started")
  try {
    const response = await api.post('/problems', {
      name,
      email,
      text,
      status: 'open',
    });
    console.log("Response", response)
    return response.data;

  } catch (error) {
    console.log('Report Problem API Error:', error.response?.data || error.message);
    console.log('Report Problem API Error status:', error.response?.status);
    throw new Error(error.response?.data?.message || 'Failed to submit report');
  }
};

export default api;
