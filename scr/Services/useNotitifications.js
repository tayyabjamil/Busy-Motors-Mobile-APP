import {useEffect, useState} from 'react';
import messaging, {getMessaging} from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform, Alert} from 'react-native';
import {Linking} from 'react-native';
import {DeepLinkingRoute} from '../Components/DeepLinkingRoute';
import {navigationRef} from '../navigationRef';
import {useDispatch, useSelector} from 'react-redux';
import Purchases from 'react-native-purchases';
import {setActiveSubscriptions} from '../redux/slices/subcriptionsSlice';
import {triggerNotificationsRefresh} from '../redux/slices/notificationsSlice';
import {getNotificationsAPI} from '../redux/api';
import {store} from '../redux/store';

// Global subscription check service
export const checkGlobalSubscriptions = async (dispatch) => {
  try {
    console.log('🌍 Checking global subscriptions on app launch...');
    const customerInfo = await Purchases.getCustomerInfo();
    const activeSubs = (customerInfo.activeSubscriptions || []).filter(
      (id: string) => id.toLowerCase().includes('scrap') || id.toLowerCase().includes('salvage')
    );

    console.log('✅ Global active subscriptions found:', activeSubs);
    console.log('📊 Full customer info on launch:', {
      originalAppUserId: customerInfo.originalAppUserId,
      activeSubscriptions: customerInfo.activeSubscriptions,
      allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers,
      entitlements: customerInfo.entitlements.active
    });
    
    // Save to Redux store
    dispatch(setActiveSubscriptions(activeSubs));
    
    return activeSubs;
  } catch (error) {
    console.log('❌ Error checking global subscriptions:', error);
    return [];
  }
};

// Hook for global subscription checking
export const useGlobalSubscriptions = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Check subscriptions when component mounts
    checkGlobalSubscriptions(dispatch);
  }, [dispatch]);
  
  return { checkGlobalSubscriptions: () => checkGlobalSubscriptions(dispatch) };
};

const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [apnsToken, setApnsToken] = useState(null);
  const [notification, setNotification] = useState(null);

  // 1. Request permissions and get tokens
  const requestPermissionsAndTokens = async () => {
    try {
      // iOS Permission
      if (Platform.OS === 'ios') {
        const authStatus = await getMessaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (!enabled) {
          console.log('User declined notification permissions');
          return false;
        }

        // Register device for remote messages first

        // Get APNs token (only works on real device)
        const apnsToken = await getMessaging().getAPNSToken();
        if (apnsToken) {
          setApnsToken(apnsToken);
          if (__DEV__) {
            await getMessaging().setAPNSToken(apnsToken, 'sandbox');
          }
        }
      }
      // Android 13+ Permission
      else if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }

      // Get FCM Token
      const token = await getFCMToken();
      return token !== null;
    } catch (error) {
      console.log('Notification setup error:', error);
      return false;
    }
  };

  // 2. Get FCM Token
  const getFCMToken = async () => {
    try {
      const token = await getMessaging().getToken();
      setFcmToken(token);
      console.log('FCM Token:', token);

      // Send to your backend
      await registerTokenWithBackend(token);

      return token;
    } catch (error) {
      console.log('FCM Token Error:', error);
      return null;
    }
  };

  const registerTokenWithBackend = async token => {
    // try {
    //   await fetch('https://your-nest-backend.com/notification/register-token', {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify({token}),
    //   });
    // } catch (error) {
    //   console.log('Failed to register token:', error);
    // }
  };

  // Helper function to trigger notifications refresh
  const refreshNotificationsList = () => {
    console.log('📬 Triggering notifications list refresh...');
    store.dispatch(triggerNotificationsRefresh());
  };

  // 3. Notification handlers
  const setupNotificationHandlers = () => {
    // Foreground messages
    const unsubscribeForeground = getMessaging().onMessage(
      async remoteMessage => {
        console.log('Foreground Notification:', remoteMessage);
        setNotification(remoteMessage);
        // Trigger refresh to fetch latest notifications
        refreshNotificationsList();
        // Optionally show alert
        showAlert(remoteMessage);
      },
    );

    // Background/Quit state messages
    getMessaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background Notification:', remoteMessage);
      setNotification(remoteMessage);
      // Trigger refresh to fetch latest notifications
      refreshNotificationsList();
    });

    // Notification opened from quit state
    getMessaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          setNotification(remoteMessage);
          // Trigger refresh to fetch latest notifications
          refreshNotificationsList();
          handleNotificationClick(remoteMessage);
        }
      });

    // Notification opened in background
    const unsubscribeBackground = getMessaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('Notification clicked:', remoteMessage);
        setNotification(remoteMessage);
        // Trigger refresh to fetch latest notifications
        refreshNotificationsList();
        handleNotificationClick(remoteMessage);
      },
    );

    // Token refresh
    const unsubscribeTokenRefresh = getMessaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
      setFcmToken(token);
      registerTokenWithBackend(token);
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
      unsubscribeTokenRefresh();
    };
  };

  const showAlert = remoteMessage => {
    Alert.alert(
      remoteMessage.notification?.title || 'New Notification',
      remoteMessage.notification?.body,
      [
        {
          text: 'OK',
          onPress: () => handleNotificationClick(remoteMessage),
        },
      ],
    );
  };

  const handleNotificationClick = remoteMessage => {
    console.log('Navigate based on:', remoteMessage.data);
    if (!remoteMessage?.data) return;

    // const url = DeepLinkingRoute(remoteMessage);

    // if (url === 'blockaccount') {
    //   return;
    // }

    if (navigationRef.isReady()) {
      navigationRef.navigate('MainStack', {
        screen: 'CarListings',
      });
    }
  };

  // Initialize everything
  useEffect(() => {
    const initializeNotifications = async () => {
      await requestPermissionsAndTokens();
      const cleanup = setupNotificationHandlers();
      return cleanup;
    };

    const cleanupPromise = initializeNotifications();
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, []);

  return {
    fcmToken,
    apnsToken,
    notification,
    getFCMToken,
    requestPermissions: requestPermissionsAndTokens,
  };
};

export default useNotifications;
