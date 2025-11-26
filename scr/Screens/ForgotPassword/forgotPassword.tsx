import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Colors from '../../Helper/Colors';
import {Fonts} from '../../Helper/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-simple-toast';
import CountryPicker from 'react-native-country-picker-modal';
import api from '../../redux/api';
import {ScrollView} from 'react-native-gesture-handler';

const ForgotPassword = ({navigation}: {navigation: any}) => {
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('GB');
  const [callingCode, setCallingCode] = useState('44');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!phone) {
      setError('Please enter a phone number');
      return;
    } else if (phone.length < 7) {
      setError('Please enter a valid phone number');
      return;
    } else {
      setError('');

      try {
        setLoading(true);
        const phoneNumber = `${callingCode}${phone}`;
        const responce = await api.post('/auth/request-otp', {
          phone: phoneNumber,
        });
        if (responce?.data?.success) {
          setLoading(false);
          Toast.show(responce?.data?.message, Toast.LONG);
          navigation.navigate('getOTP', {
            phone: phoneNumber,
          });
        } else {
          setLoading(false);
          Toast.show(
            responce?.data?.message || 'Failed to send OTP',
            Toast.LONG,
          );
        }
      } catch (error) {
        console.log('@@@@ OTP request error: ', error);

        const errorMessage =
          error?.response?.data?.message || // Server error message
          error?.message || // Fallback to Axios error message
          'An error occurred. Please try again.'; // Final fallback

        Toast.show(errorMessage, Toast.LONG);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <ImageBackground
      source={require('../../assets/background.jpeg')}
      style={styles.background}
      resizeMode="cover">
      <ScrollView>
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
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            We will send you a
            <Text style={{fontFamily: Fonts.bold}}> One Time Password</Text> on
            your phone number
          </Text>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneContainer}>
            <TouchableOpacity
              onPress={() => setVisible(true)}
              style={styles.countryPicker}>
              <CountryPicker
                withFilter
                withFlag
                withCallingCode
                withModal
                withAlphaFilter
                countryCode={countryCode}
                onSelect={country => {
                  setCountryCode(country.cca2);
                  setCallingCode(country.callingCode[0]);
                }}
                visible={visible}
                onClose={() => setVisible(false)}
              />
              <Text style={styles.callingCode}>+{callingCode}</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.phoneInput}
              placeholder="Phone Number"
              value={phone}
              onChangeText={text => {
                setPhone(text);
                setError('');
              }}
              keyboardType="phone-pad"
              placeholderTextColor="#9E9E9E"
            />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity
            style={[styles.resetButton, loading && styles.disabledButton]}
            onPress={handleForgotPassword}
            disabled={loading}>
            <Text style={styles.resetButtonText}>
              {loading ? 'Please wait...' : 'Get OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: wp(5),
    marginTop: hp(15),
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
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: hp(2),
  },

  title: {
    fontSize: wp(8),
    fontFamily: Fonts.bold,
    color: Colors.primary,
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
    fontFamily: Fonts.semiBold,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 5,
    backgroundColor: '#FFF',
    marginBottom: 5,
    height: 55,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  callingCode: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneInput: {
    flex: 1,
    borderLeftWidth: 0.3,
    padding: 10,
    height: 55,
    borderColor: '#E0E0E0',
  },
  hidingColor: {
    color: '#000000AB',
    paddingBottom: hp(1),
    fontFamily: Fonts.semiBold,
  },

  resetButton: {
    backgroundColor: Colors.primary,
    padding: hp(2),
    marginTop: hp(4),
    borderRadius: wp(2),
    alignItems: 'center',
    height: 55,
    justifyContent: 'center',
  },
  resetButtonText: {
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
  link: {
    marginTop: hp(2),
    alignItems: 'center',
  },
  linkText: {
    color: '#6C7278',
    fontFamily: Fonts.bold,
  },
  linkBold: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
});

export default ForgotPassword;
