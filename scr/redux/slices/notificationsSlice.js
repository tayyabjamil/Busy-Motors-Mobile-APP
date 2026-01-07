import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  refreshTrigger: 0, // Increment this to trigger a refresh in the UI
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Set loading state
    setNotificationsLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set notifications (replace all)
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Append notifications (for pagination)
    appendNotifications: (state, action) => {
      state.notifications = [...state.notifications, ...action.payload];
      state.loading = false;
    },
    
    // Set pagination info
    setPagination: (state, action) => {
      state.page = action.payload.page;
      state.hasMore = action.payload.hasMore;
    },
    
    // Set error
    setNotificationsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Trigger a refresh (increment counter)
    triggerNotificationsRefresh: (state) => {
      state.refreshTrigger += 1;
    },
    
    // Set unread count
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    
    // Clear notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
  },
});

export const {
  setNotificationsLoading,
  setNotifications,
  appendNotifications,
  setPagination,
  setNotificationsError,
  triggerNotificationsRefresh,
  setUnreadCount,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

