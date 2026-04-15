import React, {useEffect} from 'react';
import {Image, View, Platform} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Login from './Screens/Login/login';
import Register from './Screens/Register/register';
import Profile from './Screens/Profile/profile';
import Notifications from './Screens/Notifications/notifications';
import MapListings from './Screens/MapListings/mapListings';
import CarListings from './Screens/carListings/carListings';
import Dashboard from './Screens/Dashboard/dashboard';
import SubscriptionScreen from './Screens/Subscriptions/subscriptions';
import {useDispatch, useSelector} from 'react-redux';
import Savage from './Screens/Savage/Savage';
import {axiosHeader} from './Services/apiHeader';
import {fetchUserRequest} from './redux/slices/userDetail';
import {setActiveSubscriptions} from './redux/slices/subcriptionsSlice';
import Purchases from 'react-native-purchases';
import forgotPassword from './Screens/ForgotPassword/forgotPassword';
import getOTP from './Screens/GetOTP/getOTP';
import resetPassword from './Screens/ResetPassword/resetPassword';
import quoteMessages from './Screens/QuoteMessage/quoteMessages';
import Details from './Screens/CarDetails/carDeatils';
import {navigationRef} from './navigationRef';
import Splash from './Screens/Splash/splash';
import Colors from './Helper/Colors';
import CustomTabBar from './Components/CustomTabBar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/* Load Images from Assets */
const icons = {
  CarListings: require('./assets/home.png'),
  MapListings: require('./assets/placeholder.png'),
  Dashboard: require('./assets/dashboard.png'),
  Profile: require('./assets/user.png'),
};

/* Auth Stack */
const AuthStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
    <Stack.Screen name="forgotPassword" component={forgotPassword} />
    <Stack.Screen name="getOTP" component={getOTP} />
    <Stack.Screen name="resetPassword" component={resetPassword} />
  </Stack.Navigator>
);

/* Main Tabs */
const MainTabs = () => (
  <Tab.Navigator
  tabBar={(props) => <CustomTabBar {...props} />}
  screenOptions={({ route }) => ({
    headerShown: false,
    tabBarStyle: { height: 0 }, // hide default tab bar completely
    tabBarIcon: ({ focused }) => {
      const icon = icons[route.name];
      return (
        <Image
          source={icon}
          style={{
            width: 20,
            height: 20,
            tintColor: focused ? '#fff' : Colors.gray,
          }}
          resizeMode="contain"
        />
      );
    },
  })}
>
  <Tab.Screen name="CarListings" component={CarListings} />
  <Tab.Screen name="MapListings" component={MapListings} />
  <Tab.Screen name="Dashboard" component={Dashboard} />
  <Tab.Screen name="Profile" component={Profile} />
</Tab.Navigator>
);

/* Main Stack */
const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="CarDeatils" component={Details} />
      <Stack.Screen name="Subscriptions" component={SubscriptionScreen} />
      <Stack.Screen name="Savage" component={Savage} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="QuoteMessages" component={quoteMessages} />
    </Stack.Navigator>
  );
};

/* App Navigation */
const AppNavigation = () => {
  const authState = useSelector((state) => state.auth);

  const {token} = authState;
  console.log('🗺️ [Navigation] Current auth state:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    token: token ? `${token.substring(0, 20)}...` : 'null'
  });
  // const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();
  const {userData} = useSelector(state => state?.user);
  
  // Function to check RevenueCat subscriptions
  const checkRevenueCatSubscriptions = async (email) => {
    try {
      if (email) {
        console.log('🔑 Logging in to RevenueCat with user ID:', email);
        await Purchases.logIn(email);
        await Purchases.setEmail(email);
      }
      console.log('🔍 Checking RevenueCat subscriptions on login...');
      const customerInfo = await Purchases.getCustomerInfo();
      const activeSubs = (customerInfo.activeSubscriptions || []).filter(
        id => id.toLowerCase().includes('scrap') || id.toLowerCase().includes('salvage')
      );
      dispatch(setActiveSubscriptions(activeSubs));
      console.log('✅ RevenueCat subscriptions found on login:', activeSubs);
    } catch (error) {
      console.log('❌ Error checking RevenueCat subscriptions on login:', error);
    }
  };

  // Check device ID and active devices
  // useEffect(() => {
  //   const checkActiveDevice = async () => {
  //     try {
  //       // Get current device ID based on platform
  //       const currentDeviceId =
  //         Platform.OS === 'android'
  //           ? await DeviceInfo.getAndroidId()
  //           : await DeviceInfo.getUniqueId();
  //       if (userData?.active_devices && currentDeviceId) {
  //         // Check if current device ID exists in active devices
  //         const isDeviceActive =
  //           userData.active_devices.includes(currentDeviceId);

  //         // If device is not in active devices, logout user
  //         if (!isDeviceActive) {
  //           console.log('Device not authorized, logging out...');

  //           dispatch(logout());
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Device check error:', error);
  //     }
  //   };

  //   if (userData && token) {
  //     checkActiveDevice();
  //   }
  // }, [userData, token]);

  // Set axios header and fetch user data when token is available
  useEffect(() => {
    if (token) {
      axiosHeader(token);
      dispatch(fetchUserRequest(token));
    }
  }, [token]);

  // Once userData is loaded, identify the user in RevenueCat and check subscriptions
  useEffect(() => {
    if (token && userData?.email) {
      checkRevenueCatSubscriptions(userData.email);
    }
  }, [token, userData?.email]);

  // const linking = {
  //   prefixes: ['carscrape://'],
  //   config: {
  //     screens: {
  //       MainStack: {
  //         screens: {
  //           CarDeatils: {
  //             path: 'CarDeatils/:carId',
  //             parse: {
  //               carId: id => id,
  //             },
  //           },
  //           MainTabs: {
  //             screens: {
  //               CarListings: 'carListings',
  //               MapListings: 'mapListings',
  //               Dashboard: 'dashboard',
  //               Profile: 'profile',
  //             },
  //           },
  //         },
  //       },
  //       Notifications: 'notifications',
  //       Login: 'login',
  //     },
  //   },
  //   async getInitialURL() {
  //     const url = await Linking.getInitialURL();
  //     if (typeof url === 'string') {
  //       console.log('Initial URL:', url);
  //       return url;
  //     }
  //     return null;
  //   },

  //   subscribe(listener) {
  //     const onReceiveURL = ({url}) => {
  //       console.log('URL received:', url);
  //       listener(url);
  //     };

  //     const linkingSubscription = Linking.addEventListener('url', onReceiveURL);

  //     const unsubscribe = getMessaging().onNotificationOpenedApp(
  //       remoteMessage => {
  //         console.log('Notification clicked:', remoteMessage);
  //         const url = DeepLinkingRoute(remoteMessage);
  //         if (url === 'blockaccount') {
  //           console.log('Logout user');
  //           dispatch(logout());
  //         } else if (typeof url === 'string') {
  //           console.log('Opening URL:', url);
  //           listener(url);
  //         }
  //       },
  //     );

  //     return () => {
  //       linkingSubscription.remove();
  //       unsubscribe();
  //     };
  //   },
  // };

  return (
    <View style={{flex: 1}}> 
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName="Splash">
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="MainStack" component={MainStack} />
        <Stack.Screen name="AuthStack" component={AuthStack} />
      </Stack.Navigator>
    </NavigationContainer>
          </View>
  );
};

export default AppNavigation;
