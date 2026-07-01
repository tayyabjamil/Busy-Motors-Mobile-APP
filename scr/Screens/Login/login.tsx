import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Modal,
  Platform,
  Alert,
  Pressable,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from '../../redux/slices/authSlice';
import Colors from '../../Helper/Colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-simple-toast';
import { axiosHeader } from '../../Services/apiHeader';
import { Fonts } from '../../Helper/Fonts';
import DeviceInfo from 'react-native-device-info';
import api, { checkSubscription } from '../../redux/api';
import { NOTIFICATION_PERMISSION } from '../../Helper/Permisions';
import { checkSubscriptionRequest } from '../../redux/slices/subcriptionsSlice';
import { getMessaging } from '@react-native-firebase/messaging';
import axios from 'axios';

const DEVICE_CONFLICT_MESSAGE = 'You have already installed the app on another device';

const Login = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();
  // const {loading, loginResponse, token, loginSuccess} = useSelector(
  //   (state: any) => state.auth,
  // );
  const authState = useSelector((state: any) => state.auth);
  const { loading, loginResponse, token, error: authError } = authState;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{
    email: string;
    password: string;
  }>({
    email: '',
    password: '',
  });
  const [apiError, setApiError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('');

  useEffect(() => {
    if (authError) {
      if (authError === DEVICE_CONFLICT_MESSAGE) {
        Alert.alert('Access Denied', authError, [{text: 'OK'}], {cancelable: false});
      } else {
        setApiError(authError);
      }
    }
  }, [authError]);
//comment
  useEffect(() => {
    if (loginResponse) {
      setApiError('');
      if (loginResponse.requires_confirmation) {
        setConfirmationMessage(loginResponse.message);
        setShowConfirmationModal(true);
      } else if (loginResponse.success) {
        const setupHeaders = async () => {
          await axiosHeader(token);
          Toast.show(loginResponse?.message, Toast.LONG);
          navigation.replace('MainStack');
        };
        setupHeaders();
        dispatch(checkSubscriptionRequest({ email: email }));
      } else if (loginResponse?.error) {
        if (loginResponse.error !== DEVICE_CONFLICT_MESSAGE) {
          setApiError(loginResponse.error);
        }
      } else if (loginResponse?.success === false) {
        setApiError(loginResponse?.message || 'Login failed. Please try again.');
      }
    }
  }, [loginResponse]);
  useEffect(() => {
    if (token) {
      console.log('✅ Token available:', token);
    }
  }, [token]);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setFormErrors({
        email: '',
        password: '',
      });
      setApiError('');
    });

    return unsubscribe;
  }, [navigation]);

  const validateForm = () => {
    let errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;

    if (!email) {
      errors.email = 'Email is required';
    } else if (
      !emailRegex.test(email.trim()) &&
      !phoneRegex.test(email.trim().replace(/\s/g, ''))
    ) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmedLogin = async () => {
    setShowConfirmationModal(false);
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmed = email.trim();
      const isEmail = emailRegex.test(trimmed);

      // Get FCM token safely using the notification service
      let token = null;
      try {
        token = await getMessaging().getToken();
      } catch (tokenError) {
        console.log('FCM Token Error in login:', tokenError);
        // Continue without token if it fails
      }
      console.log('token', token);
      // Dispatch loginRequest with a flag indicating this is a confirmed attempt
      dispatch(
        loginRequest({
          email: isEmail ? trimmed : undefined,
          phone: !isEmail ? trimmed.replace(/\s/g, '') : undefined,
          password,
          deviceId,
          token,
          // isConfirmed: true,
        }),
      );
    } catch (error) {
      if (error.response?.status === 429) {
        setRateLimitMessage(
          error.response?.data?.message ||
          'Too many requests. Please try again later.',
        );
        setShowRateLimitModal(true);
      } else {
        setApiError(error.response?.data?.message || 'Login failed');
      }
    }
  };
  const handleRateLimitOk = () => {
    setShowRateLimitModal(false);
    // handleConfirmedLogin();
  };

  const handleLogin = async () => {
    if (validateForm()) {
      setApiError('');
      const deviceId = await DeviceInfo.getUniqueId();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmed = email.trim();
      const isEmail = emailRegex.test(trimmed);

      // Get FCM token safely
      let token = null;
      try {
        token = await getMessaging().getToken();
      } catch (tokenError) {
        console.log('FCM Token Error in handleLogin:', tokenError);
      }

      dispatch(
        loginRequest({
          email: isEmail ? trimmed : undefined,
          phone: !isEmail ? trimmed.replace(/\s/g, '') : undefined,
          password,
          deviceId,
          token,
        }),
      );
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background.jpeg')}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.container}>
        {/* Logo */}
        <Image source={require('../../assets/logo.png')} style={styles.logo} />

        <Text style={styles.title}>Sign in to your Account</Text>
      
        <TextInput
          style={styles.input}
          placeholder="Enter your email or phone number"
          value={email}
          onChangeText={text => {
            setEmail(text);
            setApiError('');
          }}
          keyboardType="default"
          autoCapitalize="none"
          placeholderTextColor="#9E9E9E"
        />
        {formErrors.email && (
          <Text style={styles.errorText}>{formErrors.email}</Text>
        )}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            value={password}
            onChangeText={text => {
              setPassword(text);
              setApiError('');
            }}
            secureTextEntry={!isPasswordVisible}
            placeholderTextColor="#9E9E9E"
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}>
            <Image
              source={
                isPasswordVisible
                  ? require('../../assets/visible.png')
                  : require('../../assets/NotVisible.png')
              }
              style={{
                width: isPasswordVisible ? wp(6) : wp(5),
                height: isPasswordVisible ? wp(6) : wp(5),
              }}
              tintColor={Colors.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {formErrors.password && (
          <Text style={styles.errorText}>{formErrors.password}</Text>
        )}
        {apiError && <Text style={styles.apiErrorText}>{apiError}</Text>}
        <TouchableOpacity onPress={() => navigation.navigate('forgotPassword')}>
          <Text style={{ marginLeft: wp(2), color: Colors.primary }}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}>
          <Text style={[styles.LoginButtonText, { color: Colors?.white }]}>
            {loading ? 'Please wait...' : 'Log In'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reportLink}
          onPress={() => navigation.navigate('ReportBug')}>
          <Text style={styles.reportText}>⚠ Report an Issue</Text>
        </TouchableOpacity>

        <Modal
          visible={showConfirmationModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowConfirmationModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{confirmationMessage}</Text>
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowConfirmationModal(false)}>
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    No
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleConfirmedLogin}>
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>
                    Yes, Login
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showRateLimitModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRateLimitModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{rateLimitMessage}</Text>
              <View style={styles.singleButtonRow}>
                <Pressable
                  style={[styles.button, styles.okButton]}
                  onPress={handleRateLimitOk}>
                  <Text style={[styles.buttonText, styles.okButtonText]}>
                    OK
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: wp(90),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#333',
    height: 55,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: wp(8),
    fontFamily: Fonts.bold,
    marginBottom: hp(2),
    color: Colors.primary,
    textAlign: 'center',
  },
  hidingColor: {
    color: '#000000AB',
    paddingBottom: hp(1),
    fontFamily: Fonts.semiBold,
  },
  subtitle: {
    fontSize: wp(4),
    color: '#757575',
    textAlign: 'center',
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    marginBottom: hp(2),
    fontFamily: Fonts.semiBold,
    backgroundColor: '#FFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp(2),
    backgroundColor: '#FFF',
    marginBottom: wp(3),
  },
  passwordInput: {
    flex: 1,
    height: 55,
    fontSize: wp(4),
    paddingLeft: hp(2),
    paddingRight: wp(10),
    color: '#000',
  },
  eyeIcon: {
    marginRight: hp(1.5),
  },
  loginButton: {
    backgroundColor: Colors.primary,
    marginTop: hp(5),
    borderRadius: wp(2),
    alignItems: 'center',
    height: 55,
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors?.black,
    fontSize: wp(4),
    fontFamily: Fonts.bold,
  },
  LoginButtonText: {
    color: Colors?.black,
    fontSize: wp(4),
    fontFamily: Fonts.bold,
  },
  link: {
    marginTop: hp(2),
    alignItems: 'center',
  },
  linkText: {
    color: '#6C7278',
    fontFamily: Fonts.bold,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  linkBold: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
  errorText: {
    color: 'red',
    fontSize: wp(3),
    marginBottom: hp(1),
  },
  apiErrorText: {
    color: 'red',
    fontSize: wp(3.5),
    marginBottom: hp(2),
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    marginVertical: 15,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#D3D3D3',
  },
  singleButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#D3D3D3',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  cancelButtonText: {
    fontFamily: Fonts.bold,
    color: '#007AFF',
    borderColor: '#D3D3D3',
  },
  confirmButton: {
    backgroundColor: 'white',
  },
  confirmButtonText: {
    color: Colors.red, // Use your primary color
    fontFamily: Fonts.bold,
  },
  okButton: {
    width: '100%',
  },
  okButtonText: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
  loginWithPasswordLabel: {
    fontSize: wp(4.5),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  reportLink: {
    marginTop: hp(2),
    alignItems: 'center',
  },
  reportText: {
    color: '#9E9E9E',
    fontSize: wp(3.5),
    fontFamily: Fonts.regular,
  },
});

export default Login;
