import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  loading: false, // Loading state for both login and register
  user: null, // User data after successful login or register
  error: null, // Error for both login and register
  registerResponse: null, // Response for register
  loginResponse: null, // Response for login
  token: null, // Token after successful login
  deviceId: null, // Add deviceId to state if needed
  guestLoading: false, // 👈 Add this
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login Actions
    loginRequest: state => {
      state.loading = true;
      state.loginResponse = null;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      if (action?.payload && action?.payload?.access_token) {
        state.token = action?.payload?.access_token;
      } else {
        console.log('🚨 access_token not found in payload');
      }
      state.loading = false;
      state.loginResponse = {
        success: true,
        message: action.payload?.message || '',
      };
    },

    // loginSuccess: (state, action) => {
    //   state.loading = false;
    //   // Handle both cases (confirmation required or actual login)
    //   // if (action.payload.requires_confirmation) {
    //   //   state.loginResponse = {
    //   //     requires_confirmation: true,
    //   //     message: action.payload.message,
    //   //   };
    //   // } else {
    //   if (action.payload) {
    //     console.log('object', action?.payload);
    //     state.token = action.payload.access_token;
    //     // state.deviceId = action.payload.active_devices;
    //     state.loginResponse = {
    //       success: true,
    //       message: action.payload.message,
    //     };
    //   }
    // },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload; // Save error message
      state.loginResponse = {success: false, error: action.payload};
    },
    // Inside authSlice

    guestLoginRequest: state => {
      state.guestLoading = true;
      state.error = null;
      state.loginResponse = null;
    },

    guestLoginSuccess: (state, action) => {
      state.guestLoading = false;
      state.token = action.payload.access_token;
      state.loginResponse = {
        success: true,
        message: action.payload.message,
      };
    },

    guestLoginFailure: (state, action) => {
      state.guestLoading = false;
      state.loginResponse = {
        success: false,
        error: action.payload,
      };
    },

    // Register Actions
    registerRequest: state => {
      state.loading = true;
      state.registerResponse = null;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.registerResponse = {
        success: true,
        message: action.payload.message,
        user: action.payload.user, // Save user data
      };
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.registerResponse = {
        success: false,
        error: action.payload,
      };
    },

    // Logout Action
    logout: state => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.loginResponse = null;
      state.registerResponse = null;
      state.error = null;
      state.guestLoading = false; // 👈 reset this
    },

    // Reset Register Response
    resetRegisterResponse: state => {
      state.registerResponse = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logout,
  resetRegisterResponse,
  guestLoginRequest,
  guestLoginSuccess,
  guestLoginFailure,
} = authSlice.actions;

export default authSlice.reducer;
