import {Linking, Alert, Platform, PermissionsAndroid} from 'react-native';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';

export const RequestGalleryPermission = async () => {
  const openSettings = () => {
    Linking.openSettings();
  };

  let storageStatus;

  try {
    // Request permission to access external storage.

    if (Platform.OS === 'ios') {
      storageStatus = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    } else if (Platform.OS == 'android' && Platform.Version >= 33) {
      storageStatus = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
    } else {
      storageStatus = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    }
    switch (storageStatus) {
      case RESULTS.GRANTED:
        // You can perform actions here that require the permission.
        return 'granted';

      case RESULTS.DENIED:
        // Handle the case where the user denied the permission.
        Alert.alert(
          'Permission Denied',
          'Please enable storage permissions manually in your device settings.',
          [
            {
              text: 'Open Settings',
              onPress: () => openSettings(),
              style: 'destructive',
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
        );
        return 'denied';

      case RESULTS.LIMITED:
        // Handle the case where the permission is granted but with limitations.
        Alert.alert(
          'Permission Limited',
          'Storage permission is granted but with limitations. Access to media images may be restricted.',
          [
            {
              text: 'Open Settings',
              onPress: () => openSettings(),
              style: 'destructive',
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
        );
        return 'limited';

      case RESULTS.BLOCKED:
        // Provide information to the user about how to enable the permission manually.
        Alert.alert(
          'Permission Blocked',
          'Storage permission is blocked. Please enable it in your device settings.',
          [
            {
              text: 'Open Settings',
              onPress: () => openSettings(),
              style: 'destructive',
            },
            {
              text: 'Cancel',

              style: 'cancel',
            },
          ],
        );
        return 'blocked';

      case RESULTS.UNAVAILABLE:
        // Handle the case where permission status is unavailable.
        Alert.alert(
          'Permission Unavailable',
          'Unable to determine storage permission status. Please try again later.',
          [
            {
              text: 'Open Settings',
              onPress: () => openSettings(),
              style: 'destructive',
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
        );
        return 'unavailable';

      default:
        return 'unknown';
    }
  } catch (error) {
    console.error('Error while requesting storage permission:', error);
    return 'error';
  }
};

export const RequestLocationPermission = async () => {
  const openSettings = () => {
    Linking.openSettings();
  };

  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    Alert.alert(
      'Unsupported Platform',
      'This functionality is only available on Android and iOS.',
    );
    return 'unsupported_platform';
  }

  try {
    let granted;

    if (Platform.OS === 'android') {
      granted = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    } else {
      granted = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    }

    if (granted === RESULTS.GRANTED) {
      console.log('Location permission granted');
      return 'granted';
    } else if (granted === RESULTS.DENIED) {
      Alert.alert(
        'Permission Denied',
        'Location permission is denied. Please enable it manually in your device settings.',
        [
          {text: 'Open Settings', onPress: openSettings, style: 'destructive'},
          {text: 'Cancel', style: 'cancel'},
        ],
      );
      return 'denied';
    } else if (granted === RESULTS.BLOCKED) {
      Alert.alert(
        'Permission Blocked',
        'Location permission is blocked. Please enable it manually in your device settings.',
        [
          {text: 'Open Settings', onPress: openSettings, style: 'destructive'},
          {text: 'Cancel', style: 'cancel'},
        ],
      );
      return 'blocked';
    }

    return 'unknown';
  } catch (error) {
    console.error('Error while requesting location permission:', error);
    return 'error';
  }
};

export const NOTIFICATION_PERMISSION = async () => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        // Request notification permission for Android 13+
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'Allow DAUD TRANSPORT to send you notifications.',
            buttonPositive: 'OK',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
          },
        );

        return result;
      } else {
        // Automatically granted on older versions of Android
        return 'granted';
      }
    } else if (Platform.OS === 'ios') {
    } else {
      console.warn('Unsupported platform');
      return 'unsupported_platform';
    }
  } catch (err) {
    console.warn('Permission request failed', err);
    Error_Toaster(
      'An error occurred while requesting notification permissions.',
    );
    return 'error';
  }
};
