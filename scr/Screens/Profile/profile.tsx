import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../../redux/slices/authSlice';
import {fetchUserRequest} from '../../redux/slices/userDetail';
import {
  updateProfileRequest,
  resetProfileUpdateState,
} from '../../redux/slices/userProfileUpdateSlice';
import Colors from '../../Helper/Colors';
import {hp, wp} from '../../Helper/Responsive';
import Toast from 'react-native-simple-toast';
import CountryPicker from 'react-native-country-picker-modal';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Header from '../../Components/Header';
import {Fonts} from '../../Helper/Fonts';
import {navigationRef} from '../../navigationRef';
import axios from 'axios';
import {selectImage} from '../../Functions/MediaManager';

const Profile = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const token = useSelector((state: any) => state.auth?.token);
  const {
    loading: userLoading,
    userData,
    error: userError,
  } = useSelector((state: any) => state.user);
  const {
    loading: updateLoading,
    success: updateSuccess,
    error: updateError,
    message,
  } = useSelector((state: any) => state.profileUpdate);
  const dispatch = useDispatch();
  const [showImage, setShowImage] = useState<{uri: string} | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [countryCode, setCountryCode] = useState('GB');
  const [callingCode, setCallingCode] = useState('44');
  const [visible, setVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  useEffect(() => {
    setErrors({});

    if (isFocused) {
      dispatch(fetchUserRequest(token));
    }
    setErrors({});
  }, [isFocused]);
  useEffect(() => {
    if (userData) {
      if (userData.is_guest) {
        setFirstName('guest');
        setLastName('guest');
        setEmail('guest');
      } else {
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        setEmail(userData.email || '');
        setPhoneNumber(userData.phone_number || '');
      }

      setShowImage(userData.profile_image || '');
    }
  }, [userData]);

  useEffect(() => {
    if (updateSuccess && message) {
      Toast.show(message, Toast.LONG);

      dispatch(resetProfileUpdateState());
      dispatch(fetchUserRequest(token));
    }
  }, [updateSuccess, token]);

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    // if (!phoneNumber.trim()) {
    //   newErrors.phoneNumber = 'Phone number is required';
    // } else if (!/^\d{10}$/.test(phoneNumber)) {
    //   newErrors.phoneNumber = 'Phone number must be 10 digits';
    // }
    if (!showImage) {
      newErrors.showImage = 'Profile picture is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setErrors(prevErrors => ({...prevErrors, [field]: null}));
    switch (field) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phoneNumber':
        setPhoneNumber(value);
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    if (userData?.is_guest) {
      Toast.show(
        'Guest users cannot update profile. Please log in to make changes.',
        Toast.LONG,
      );
      return; // Stop further execution
    }
    if (validateForm()) {
      const formData = new FormData();

      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('phone', phoneNumber);

      // Profile image ko alag file ke tarah append karo
      if (showImage?.uri) {
        formData.append('profile_image', {
          uri: showImage.uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
      }
      dispatch(updateProfileRequest({token, updatedData: formData}));
    }
  };

  const handleLogout = () => {
    setModalVisible(false);
    dispatch(logout());
    navigationRef.current?.reset({
      index: 0,
      routes: [{name: 'AuthStack'}],
    });
    Toast.show('You have been logged out successfully.', Toast.LONG);
  };

  const deleteProfile = async () => {
    try {
      const response = await axios.delete(
        `https://scrape4you.onrender.com/auth/delete-agent/${userData?.userId}`,
      );
      if (response.status === 200) {
        setDeleteModalVisible(false);
        dispatch(logout());
        navigationRef.current?.reset({
          index: 0,
          routes: [{name: 'AuthStack'}],
        });
        Toast.show('Profile deleted successfully', Toast.LONG);
      } else {
        Toast.show('Failed to delete profile', Toast.LONG);
      }
    } catch (error) {
      console.log('Delete error:', error);
      Toast.show('Something went wrong while deleting profile', Toast.LONG);
    }
  };
  if (userLoading || updateLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // if (userError || updateError) {
  //   return (
  //     <View style={styles.errorContainer}>
  //       <Text style={styles.errorText}>Error: {userError || updateError}</Text>
  //     </View>
  //   );
  // }
  const handleImageSelection = async document => {
    setShowImage(document);
  };
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{backgroundColor: Colors.white}}>
      <SafeAreaView
        style={[
          styles.container,
          {paddingTop: Platform.OS === 'ios' ? hp(2) : 0},
        ]}>
        <Header navigation={navigation} textData={'User Profile'} />
        <View style={styles.profileSection}>
          <View style={styles.profileContainer}>
            <Image
              source={
                showImage && showImage?.uri
                  ? {uri: showImage?.uri}
                  : showImage?.includes('https')
                  ? {uri: showImage} // local image (e.g., file://...)
                  : require('../../assets/user(2).png')
              }
              style={styles.profileImage}
            />

            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => selectImage(handleImageSelection)}>
              <Image
                source={require('../../assets/camera.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.hidingColor}>First Name</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            placeholder="First Name"
            value={firstName}

            onChangeText={value => handleInputChange('firstName', value)}
            placeholderTextColor={Colors.gray}
          />
          {errors?.firstName && (
            <Text style={styles.errorText}>{errors?.firstName}</Text>
          )}
          <Text style={styles.hidingColor}>Last Name</Text>

          <TextInput
            style={[styles.input, errors?.lastName && styles.inputError]}
            placeholder="Last Name"
            value={lastName}
            onChangeText={value => handleInputChange('lastName', value)}
            placeholderTextColor={Colors.gray}
          />
          {errors?.lastName && (
            <Text style={styles.errorText}>{errors?.lastName}</Text>
          )}
          <Text style={styles.hidingColor}>Email Address</Text>
        <View style={[styles.inputWrapper, errors?.email && styles.inputError]}>
  <Image
    source={require('../../assets/Email.png')}
    style={styles.iconBack}
    tintColor={Colors.backIconColor}
  />
  <TextInput
    style={styles.inputWithIcon}
    placeholder="Email Address"
    value={email}
    onChangeText={value => handleInputChange('email', value)}
    keyboardType="email-address"
    placeholderTextColor={Colors.gray}
  />
</View>
      {errors?.email && <Text style={styles.errorText}>{errors?.email}</Text>}
        </View>
        <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          if (userData?.is_guest) {
            Toast.show(
              'Guest accounts cannot be deleted. Please log in to delete your profile.',
              Toast.LONG
            );
          } else {
            setDeleteModalVisible(true);
          }
        }}
      >
        <Text style={styles.deleteButtonText}>Delete Profile</Text>
      </TouchableOpacity>
    </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTopText}>Confirm Deletion</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete your profile?
              </Text>
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setDeleteModalVisible(false)}>
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    No, Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.confirmDeleteButton]}
                  onPress={() => {
                    deleteProfile();
                  }}>
                  <Text style={styles.confirmDeleteButtonText}>
                    Yes, Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
         <TouchableOpacity
          style={styles.logout}
          onPress={() => setModalVisible(true)}>
 <View style={styles.logoutContent}>
         <Image
    source={require('../../assets/Logout Cancel Circle Shape.png')}
    style={styles.iconBack}
    tintColor={Colors.backIconColor}
  />
  <Text style={styles.logoutText}>Logout</Text>
  </View>
      </TouchableOpacity>
       
          
    
        {/* Logout Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTopText}>
                {userData?.is_guest
                  ? 'Guest User'
                  : userData?.first_name + ' ' + userData?.last_name}
              </Text>
              <Text style={styles.modalText}>
                Are you sure you want to log out ?
              </Text>
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}>
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.logoutButton]}
                  onPress={handleLogout}>
                  <Text style={[styles.buttonText, styles.logoutButtonText]}>
                    Log out
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    backgroundColor: Colors.white,
    margin: Platform.OS === 'ios' ? 20 : 5,
  },
  headerTitleStyle: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    marginTop: hp(3),
  },
  iconBack: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },

  header: {
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: wp(5),
  },
  backButton: {
    marginRight: 10,
  },
  backText: {
    fontSize: 24,
    color: '#007BFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderWidth: 0.4,
    borderColor: 'lightgray',
    borderRadius: 60,
  },
  profileImage: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(16),
    resizeMode: 'contain',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputContainer: {
    marginBottom: 20,
  },
  logoutContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
},
  input: {
    borderWidth:1,
    borderColor: '#E0E0E0',
    borderRadius: 100,
    marginBottom: 15,
    backgroundColor: '#FFF',
    fontSize: 16,
    fontFamily: Fonts.regular,
    height: 50,
    paddingHorizontal: 20,
    shadowColor: Colors.black,
    shadowOpacity: 0.10,
    shadowRadius: wp(1),
    shadowOffset: { width: 0, height: hp(0.5) },
    elevation: 5,
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
    height: 50,
    borderColor: '#E0E0E0',
  },
   inputWrapper: {
        flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E0E0E0',
  borderRadius: 100,
  backgroundColor: '#FFF',
  height: 50,
  paddingHorizontal: 15, // same as first/last name
  marginBottom: 15,
  shadowColor: Colors.black,
  shadowOpacity: 0.1,
  shadowRadius: wp(1),
  shadowOffset: { width: 0, height: hp(0.5) },
  elevation: 5,
  },
 inputWithIcon: {
  flex: 1,
  fontSize: 16,
  fontFamily: Fonts.regular,
  color: Colors.black,
  paddingLeft:10,
  height: '100%', // makes it fill wrapper height like first/last name inputs
},
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  logoutText: {
    fontSize: 16,
    color:'black',
    fontFamily: Fonts.semiBold,
    textAlign: 'center',
    fontWeight:'bold'
  },
   buttonContainer: {
    flexDirection: 'row',
    marginBottom: 15,
   gap:20
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
     flex: 1,
    borderRadius: 25,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: wp(1),
    shadowOffset: { width: 0, height: hp(0.5) },
    elevation: 5,
    paddingHorizontal:8
  },
  logout: {
    marginTop:13,
  backgroundColor: Colors.white, 
  height: 50,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 25,
  marginBottom: 20,
  shadowColor: Colors.black,
  shadowOpacity: 0.1,
  shadowRadius: wp(1),
  shadowOffset: { width: 0, height: hp(0.5) },
  elevation: 5,
  borderWidth:1,
  borderColor: '#E0E0E0',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    padding: wp(2),
    fontFamily: Fonts.bold,
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTopText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    marginVertical: 15,
    textAlign: 'center',
    color: Colors.gray,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: wp(4),
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
    fontFamily: Fonts.regular,
    borderColor: '#D3D3D3',
  },
  cancelButtonText: {
    fontFamily: Fonts.bold,
    color: '#007AFF',
  },
  logoutButton: {
    backgroundColor: 'white',
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontFamily: Fonts.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidingColor: {
    color: 'black',
    paddingBottom: hp(1),
    fontFamily: Fonts.semiBold,
    fontWeight:'600',
    fontSize:16
  },
  deleteButton: {
    backgroundColor: Colors.white,
    padding: wp(2),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderColor:'red',
    height: 50,
    borderRadius: 25,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: wp(1),
    shadowOffset: { width: 0, height: hp(0.5) },
    elevation: 5,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FF3B30',
    fontFamily: Fonts.semiBold,
  },

  confirmDeleteButton: {
    borderRadius: 5,
    marginLeft: 5,
  },
  confirmDeleteButtonText: {
    color: '#FF3B30',
    fontFamily: Fonts.bold,
  },
  icon: {
    width: wp(4),
    resizeMode: 'contain',
    height: wp(4),
    tintColor: Colors.white,
  },
});

export default Profile;
