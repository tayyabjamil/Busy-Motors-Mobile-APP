import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import Colors from '../../Helper/Colors';
import {Fonts} from '../../Helper/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-simple-toast';
import api from '../../redux/api';

const GetOTP = ({navigation, route}: {navigation: any; route: any}) => {
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setError('');
    try {
      setLoading(true);
      const phoneNumber = route?.params?.phone;
      const responce = await api.post('/auth/verify-otp', {
        phone: phoneNumber,
        otp: otp,
      });
      if (responce?.data?.success) {
        setLoading(false);
        Toast.show(responce?.data?.message, Toast.LONG);
        navigation.navigate('resetPassword', {
          phone: phoneNumber,
        });
      } else {
        setLoading(false);
        Toast.show(responce?.data?.message || 'Failed to send OTP', Toast.LONG);
      }
    } catch (error) {
      setLoading(false);

      console.log('@@asOTP request error:', error);
      const errorMessage =
        error?.response?.data?.message || // Server error message
        error?.message || // Fallback to Axios error message
        'An error occurred. Please try again.'; // Final fallback

      Toast.show(errorMessage, Toast.LONG);
    } finally {
      setLoading(false);
    }
    // navigation.navigate('resetPassword');
  };
  const inputRef = React.useRef(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };
  return (
    <ImageBackground
      source={require('../../assets/background.jpeg')}
      style={styles.background}
      resizeMode="cover">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingContainer}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="handled">
          <View style={styles.leftSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.4}>
              <Image
                source={require('../../assets/left-arrow.png')}
                style={styles.iconBack}
                tintColor={Colors?.backIconColor}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.container}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>
              A <Text style={{fontFamily: Fonts.bold}}>One Time Password</Text>{' '}
              has been sent to your phone number
            </Text>

            <Text style={styles.label}>OTP</Text>
            <View style={styles.container}>
              {/* OTP Boxes */}
              <View style={styles.otpBoxContainer} onTouchStart={focusInput}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <View key={i} style={styles.otpBox}>
                    <Text style={styles.otpDigit}>{otp[i] || ''}</Text>
                    {i === otp.length && !otp[i] && (
                      <View style={styles.cursor} />
                    )}
                  </View>
                ))}
              </View>

              {/* Hidden TextInput */}
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={text => {
                  if (/^\d*$/.test(text)) {
                    setOtp(text);
                    setError('');
                  }
                }}
                autoFocus
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.disabledButton]}
              onPress={handleVerifyOTP}
              disabled={loading}>
              <Text style={styles.verifyButtonText}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    // paddingHorizontal: wp(5),
    marginTop: hp(12),
  },
  backButton: {
    marginRight: wp(1),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: wp(7),
    marginTop: 60,
  },
  iconBack: {
    width: wp(5),
    height: wp(5),
    resizeMode: 'contain',
  },
  logo: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginBottom: hp(2),
  },
  title: {
    fontSize: wp(8),
    fontFamily: Fonts.bold,
    color: '#007BFF',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: wp(4),
    color: '#757575',
    textAlign: 'center',
    fontFamily: Fonts.semiBold,
    backgroundColor: '#FFF',
    padding: wp(2),
    borderRadius: wp(2),
    marginBottom: hp(3),
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 5,
    marginLeft: wp(3),
    fontFamily: Fonts.semiBold,
  },
  otpBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
    marginBottom: hp(2),
    paddingHorizontal: wp(5),
    position: 'relative',
  },
  otpBox: {
    width: wp(12),
    height: wp(13),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  otpDigit: {
    fontSize: wp(6),
    fontFamily: Fonts.bold,
    color: '#000',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  verifyButton: {
    backgroundColor: '#007BFF',
    padding: hp(2),
    marginTop: hp(4),
    borderRadius: wp(2),
    alignItems: 'center',
    margin: 40,
  },
  verifyButtonText: {
    color: Colors?.white,
    fontSize: wp(4),
    fontFamily: Fonts.bold,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  errorText: {
    color: 'red',
    fontSize: wp(3.2),
    marginTop: hp(0.5),
    marginBottom: hp(1),
  },
});

export default GetOTP;
