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
import {useNavigation} from '@react-navigation/native';

const ResetPassword = ({route}: {route: any}) => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password) {
      setError('Please enter your password');
    } else if (!confirmPassword) {
      setError('Please enter your confirm password');
    } else if (password.length < 6) {
      setError('Password must be at least 6 characters');
    } else if (password !== confirmPassword) {
      setError("Passwords don't match");
    } else {
      setError('');
      try {
        setLoading(true);

        const responce = await api.put('/auth/reset-password', {
          password: password,
          phone: route?.params?.phone,
        });
        if (responce?.data?.success) {
          setLoading(false);
          Toast.show('Password reset successful', Toast.LONG);
          navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
          });
        } else {
          setLoading(false);
          Toast.show(
            responce?.data?.message || 'Failed to send OTP',
            Toast.LONG,
          );
        }
      } catch (error) {
        setLoading(false);

        console.log('reset password request error:', error);
        const errorMessage =
          error?.response?.data?.message || // Server error message
          error?.message || // Fallback to Axios error message
          'An error occurred. Please try again.'; // Final fallback

        Toast.show(errorMessage, Toast.LONG);
      } finally {
        setLoading(false);
      }
      // Toast.show('Password reset successfully!');
      // navigation.navigate('login');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background.jpeg')}
      style={styles.background}
      resizeMode="cover">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Please enter your new password and confirm it to reset your
              account.
            </Text>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                secureTextEntry={!showPassword}
                placeholderTextColor="#9E9E9E"
                value={password}
                onChangeText={text => {
                  setError('');
                  setPassword(text);
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image
                  source={
                    showPassword
                      ? require('../../assets/visible.png')
                      : require('../../assets/NotVisible.png')
                  }
                  style={styles.eyeIcon}
                  resizeMode="contain"
                  tintColor={Colors.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm new password"
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#9E9E9E"
                value={confirmPassword}
                onChangeText={text => {
                  setError('');
                  setConfirmPassword(text);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Image
                  source={
                    showConfirmPassword
                      ? require('../../assets/visible.png')
                      : require('../../assets/NotVisible.png')
                  }
                  style={styles.eyeIcon}
                  resizeMode="contain"
                  tintColor={Colors.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.resetButton, loading && styles.disabledButton]}
              onPress={handleResetPassword}
              disabled={loading}>
              <Text style={styles.resetButtonText}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: wp(5),
    marginTop: hp(10),
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    marginBottom: hp(2),
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontFamily: Fonts.regular,
    fontSize: wp(4),
  },
  eyeIcon: {
    width: wp(6),
    height: wp(6),
    marginLeft: 10,
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
    fontFamily: Fonts.semiBold,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#FFF',
    fontFamily: Fonts.regular,
    fontSize: wp(4),
    marginBottom: hp(2),
  },
  resetButton: {
    backgroundColor: '#007BFF',
    padding: hp(2),
    marginTop: hp(2),
    borderRadius: wp(2),
    alignItems: 'center',
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
});
