import {Linking, Alert, Platform} from 'react-native';
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
