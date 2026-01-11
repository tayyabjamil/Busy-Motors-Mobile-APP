import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  Alert,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hp, wp } from '../../Helper/Responsive';
import Colors from '../../Helper/Colors';
import Header from '../../Components/Header';
import Banner from '../../Components/Banner';
import { Fonts } from '../../Helper/Fonts';
import { useDispatch, useSelector } from 'react-redux';
import WebView from 'react-native-webview';
import { resetQuoteState, sendQuoteRequest } from '../../redux/slices/qouteSlice';
import Toast from 'react-native-simple-toast';
import { navigationRef } from '../../navigationRef';
import { logout } from '../../redux/slices/authSlice';

const defaultCarImage = require('../../assets/car2.png');

// Map of make names to brand logo images
const makeToImageMap: {[key: string]: any} = {
  'aston martin': require('../../assets/cars/astonmartin.png'),
  'astonmartin': require('../../assets/cars/astonmartin.png'),
  'baic': require('../../assets/cars/baic.png'),
  'bmw': require('../../assets/cars/bmw.png'),
  'bugatti': require('../../assets/cars/bugatti.png'),
  'chevrolet': require('../../assets/cars/chevrolet.png'),
  'citroen': require('../../assets/cars/citroen.png'),
  'dacia': require('../../assets/cars/dacia.png'),
  'daihatsu': require('../../assets/cars/daihatsu.png'),
  'dodge': require('../../assets/cars/dodge.png'),
  'dongfeng': require('../../assets/cars/dongfeng.png'),
  'ford': require('../../assets/cars/ford.png'),
  'honda': require('../../assets/cars/honda.png'),
  'hyundai': require('../../assets/cars/hyundai.png'),
  'kia': require('../../assets/cars/kia.png'),
  'lamborghini': require('../../assets/cars/lamborghini.png'),
  'lotus': require('../../assets/cars/lotus.png'),
  'mazda': require('../../assets/cars/mazda.png'),
  'mclaren': require('../../assets/cars/mclaren.png'),
  'mercedes': require('../../assets/cars/mercedes-benz.png'),
  'mercedes-benz': require('../../assets/cars/mercedes-benz.png'),
  'mercedesbenz': require('../../assets/cars/mercedes-benz.png'),
  'mg': require('../../assets/cars/mg.png'),
  'mini': require('../../assets/cars/mini.png'),
  'nissan': require('../../assets/cars/nissan.png'),
  'opel': require('../../assets/cars/opel.png'),
  'proton': require('../../assets/cars/proton.png'),
  'rolls royce': require('../../assets/cars/rollsroyce.png'),
  'rollsroyce': require('../../assets/cars/rollsroyce.png'),
  'rolls-royce': require('../../assets/cars/rollsroyce.png'),
  'saic': require('../../assets/cars/saic.png'),
  'skoda': require('../../assets/cars/skoda.png'),
  'suzuki': require('../../assets/cars/suzuki.png'),
  'tesla': require('../../assets/cars/tesla.png'),
  'vauxhall': require('../../assets/cars/vauxhall.png'),
  'volkswagen': require('../../assets/cars/volkswagen.png'),
  'volvo': require('../../assets/cars/volvo.png'),
  'xpeng': require('../../assets/cars/xpeng.png'),
};

// Function to get car image and determine if it's a logo
const getCarImageData = (make: string, carImage: string) => {
  const normalizedMake = make?.toLowerCase().trim();

  // If car has a valid image from API, use it with cover
  if (carImage && carImage !== 'N/A') {
    return { source: { uri: carImage }, isLogo: false };
  }

  // Check if we have a local brand logo for this make
  if (normalizedMake && makeToImageMap[normalizedMake]) {
    return { source: makeToImageMap[normalizedMake], isLogo: true };
  }
  
  // Fallback to default car image (treat as logo/contain)
  return { source: defaultCarImage, isLogo: true };
};

const Details = ({ route }) => {
  const dispatch = useDispatch();
  const car = route?.params?.car || null;

  if (!car) {
    return null;   // or a loader, or fallback UI
  }

  // Get active subscriptions from RevenueCat (global check)
  const activeSubscriptions = useSelector(
    state => state?.subscription?.activeSubscriptions || [],
  );

  // Check if user has any active subscriptions
  const hasActiveSubscription = activeSubscriptions.length > 0;

  const { userData } = useSelector(state => state.user);
  const token = useSelector(state => state.auth?.token);
  const qoute = useSelector(state => state?.quote);
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState({
    messageError: '',
    amountError: '',
  });
  // const isSubscribed = true; // <--- temporarily hardcoded

  useEffect(() => {
    if (qoute?.success) {
      Toast.show('Quote sent successfully!', Toast.SHORT);
      setMessage('');
      setAmount('');
      dispatch(resetQuoteState());
    }
  }, [qoute?.success]);

  const handleSendQoute = () => {
    if (!hasActiveSubscription) {
      showSubscriptionAlert();
      return;
    }
    let hasError = false;
    let newErrors = { messageError: '', amountError: '' };

    if (!message.trim()) {
      newErrors.messageError = 'Please enter a message';
      hasError = true;
    }

    if (!amount.trim()) {
      newErrors.amountError = 'Please enter an amount';
      hasError = true;
    }

    if (hasError) {
      setError(newErrors);
      return;
    }
    // Dispatch action
    dispatch(
      sendQuoteRequest({
        listingId: car?._id,
        userId: userData?.userId,
        amount,
        message,
        token,
      }),
    );
  };

  const handlePlaceBid = () => {
    if (!amount.trim()) {
      setError(prev => ({ ...prev, amountError: 'Please enter an amount' }));
      return;
    }

    // You can optionally give feedback like toast or log
    console.log('Bid Placed with Amount:', amount);
    Toast.show(`Bid placed: ₹${amount}`, Toast.SHORT);
  };

  const handleGuestSignIn = () => {
    dispatch(logout());
    navigationRef.current?.reset({
      index: 0,
      routes: [
        {
          name: 'AuthStack',
          state: {
            routes: [{name: 'Login'}],
          },
        },
      ],
    });
  };

  const handleCall = phoneNumber => {
    // Check if user is guest
    if (userData?.is_guest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to contact the seller and access all features.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: handleGuestSignIn,
          },
        ]
      );
      return;
    }

    // Check if user has subscription
    if (!hasActiveSubscription) {
      showSubscriptionAlert();
      return;
    }

    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleTextMessage = phoneNumber => {
    // Check if user is guest
    if (userData?.is_guest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to contact the seller and access all features.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: handleGuestSignIn,
          },
        ]
      );
      return;
    }

    // Check if user has subscription
    if (!hasActiveSubscription) {
      showSubscriptionAlert();
      return;
    }

    Linking.openURL(`sms:${phoneNumber}`);
  };

  const handleWhatsApp = phoneNumber => {
    // Check if user is guest
    if (userData?.is_guest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to contact the seller and access all features.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: handleGuestSignIn,
          },
        ]
      );
      return;
    }

    // Check if user has subscription
    if (!hasActiveSubscription) {
      showSubscriptionAlert();
      return;
    }

    Linking.openURL(`https://wa.me/${phoneNumber}`);
  };

  const handleMotHistory = () => {
    // Check if user is guest
    if (userData?.is_guest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to access MOT history and all features.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: handleGuestSignIn,
          },
        ]
      );
      return;
    }

    // Check if user has subscription
    if (!hasActiveSubscription) {
      showSubscriptionAlert();
      return;
    }

    setWebViewUrl(
      `https://www.check-mot.service.gov.uk/results?registration=${car?.registrationNumber}`,
    );
    setShowWebView(true);
  };

  const showSubscriptionAlert = () => {
    Alert.alert(
      'Premium Feature 🔒',
      'To access MOT history and contact details, please upgrade to our premium subscription. Enjoy unlimited access to all features!',
      [
        {
          text: 'Maybe Later',
          style: 'cancel',
        },
        {
          text: 'Subscribe Now',
          onPress: () => navigationRef.navigate('Subscriptions'),
          style: 'default',
        },
      ],
      { cancelable: true },
    );
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };


  console.log('car', car);
  return (
    <SafeAreaView style={styles.container}>

    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
                  <Header navigation={navigationRef} showBackButton showNotification={false} textData={'Car Details'} />

      <ScrollView
        style={[
          styles.container,
        ]}>
    
        <View style={[styles.sidePadding]}>
          <View style={styles.detailsContainer}>
            {(() => {
              const imageData = getCarImageData(car?.make, car?.carImage);
              return (
                <Image
                  source={imageData.source}
                  style={styles.carImage}
                  resizeMode={imageData.isLogo ? 'contain' : 'cover'}
                />
              );
            })()}

            <Text style={styles.carTitle}>
              {car?.make || 'Model Not Available'}
            </Text>

            {[
              ['Registration :', car?.registrationNumber],
              ['Year :', car?.yearOfManufacture],
              ['Postcode :', car?.postcode],
              ['Colour :', car?.color],
              ['Model :', car?.model],
              ['Fuel Type :', car?.fuelType],
            ].map(([label, value], index) => {
              // Show only first 3 characters for postcode with ellipsis
              const displayValue = label === 'Postcode :'
                ? (value?.toString() && value.toString().length > 3
                  ? value.toString().substring(0, 3).toUpperCase() + '...'
                  : (value?.toString().toUpperCase() || 'N/A'))
                : (value?.toString().toUpperCase() || 'N/A');

              return (
                <View key={index} style={styles.infoRow}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
                    {displayValue}
                  </Text>
                </View>
              );
            })}
            <View style={styles.motContainer}>
              <Image
                source={require('../../assets/Union.png')}
                style={styles.motImage}
              />
              <View style={styles.textContainer}>
                <View style={styles.rowText}>
                  <Text style={styles.title}>MOT Status: {car?.motStatus}</Text>
                  <TouchableOpacity
                    style={styles.motHistoryButton}
                    onPress={() => handleMotHistory()}>
                    <Text style={styles.motHistoryText}>MOT history</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.expiry}>
                  Expiry: {formatDate(car?.motExpiryDate)}
                </Text>
              </View>
            </View>
            {!hasActiveSubscription && <Banner navigation={navigationRef} />}
          </View>

          <View style={styles.contactContainer}>
            <Text style={styles.contactTitle}>Contact Seller Via</Text>
            <View style={styles.contactIcons}>
              {[
                ['Call', require('../../assets/apple.png'), handleCall],
                [
                  'WhatsApp',
                  require('../../assets/whatsapp.png'),
                  handleWhatsApp,
                ],
                ['Text', require('../../assets/messages.png'), handleTextMessage],
              ].map(([text, icon, action], index) => {
                const isSold = car?.isSold;
                const opacityStyle = { opacity: isSold ? 0.3 : 1 };

                return (
                  <View key={index}>
                    <TouchableOpacity
                      style={[
                        styles.contactButton,
                        styles[`${text.toLowerCase()}Button`],
                        opacityStyle,
                      ]}
                      onPress={() => {
                        if (!isSold) {
                          action('+' + car?.phoneNumber);
                        }
                      }}
                      activeOpacity={isSold ? 1 : 0.7}
                      disabled={isSold}>
                      <Image source={icon} style={[styles.icon, opacityStyle]} />
                    </TouchableOpacity>
                    <Text style={[styles.contactText, opacityStyle]}>{text}</Text>
                  </View>
                );
              })}
            </View>
          </View>
          {/* {!car?.isSold && (
          <View style={styles.messageBox}>
            <TextInput
              placeholder="Write your message..."
              style={[styles.textArea, {height: hp(15)}]}
              multiline
              placeholderTextColor={Colors.gray}
              numberOfLines={4}
              textAlignVertical="top"
              value={message}
              onChangeText={text => {
                setMessage(text);
                setError(prev => ({...prev, messageError: ''}));
              }}
            />
            {error.messageError ? (
              <Text style={styles.errorText}>{error.messageError}</Text>
            ) : null}

            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInputCompact}
                keyboardType="numeric"
                placeholderTextColor={Colors.gray}
                placeholder="Enter Amount"
                value={amount}
                onChangeText={text => {
                  setAmount(text);
                  setError(prev => ({...prev, amountError: ''}));
                }}
              />

              <TouchableOpacity
                style={styles.bidButton}
                onPress={() => handleSendQoute()}>
                <Text style={styles.bidButtonText}>Place a Bid latest</Text>
              </TouchableOpacity>
            </View>
            {error.amountError ? (
              <Text style={styles.errorText}>{error.amountError}</Text>
            ) : null}
          </View>
        )} */}
        </View>
        <Modal
          visible={showWebView}
          animationType="slide"
          onRequestClose={() => setShowWebView(false)}>
          <SafeAreaView style={styles.webViewContainer}>
            <View
              style={[
                styles.webViewHeader,
                Platform.OS === 'ios' && styles.webViewHeaderIOS,
              ]}>
              <TouchableOpacity
                onPress={() => setShowWebView(false)}
                style={[
                  styles.closeButton,
                  Platform.OS === 'ios' && styles.closeButtonIOS,
                ]}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <WebView
              source={{ uri: webViewUrl }}
              style={styles.webView}
              startInLoadingState={true}
              onError={syntheticEvent => {
                console.error('WebView error:', syntheticEvent.nativeEvent);
              }}
            />

          </SafeAreaView>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sidePadding: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  detailsContainer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: wp(3),
    marginBottom: 20,
  },
  carImage: {
    width: '100%',
    height: 200,
  },
  carTitle: {
    fontSize: wp(6),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  carTagContainer: {
    backgroundColor: Colors.primary,
    borderRadius: wp(10),
    margin: hp(2),

    alignSelf: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  scrapText: {
    textTransform: 'capitalize',
    paddingHorizontal: 20,
    paddingVertical: 5,
    textAlign: 'center',
    fontFamily: Fonts.regular,
    color: Colors.white,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    marginBottom: hp(1),
  },
  headerContainer: {
    paddingTop: hp(4),
  },
  label: {
    fontSize: wp(4),
    fontFamily: Fonts.regular,
    color: 'black',
    width: '35%',
    textAlign: 'left',
  },
  value: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.gray,
    width: '65%',
    fontWeight:'bold'
  },
  motContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    marginBottom: 20,
    width: wp(80),
    marginTop: 10,
  },
  motImage: {
    width: wp(6),
    height: wp(6),
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
    marginLeft: wp(2),
  },
  rowText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    fontSize: wp(3.5),
    fontFamily: Fonts.semiBold,
    color: 'black',
    flex: 1,
  },
  viewText: {
    fontFamily: Fonts.semiBold,
    fontSize: wp(3.2),
    color: '#3b4d6c',
    marginLeft: wp(2),
  },
  expiry: {
    fontSize: wp(3),
    fontFamily: Fonts.regular,
    color: '#3b4d6c',
  },

  contactContainer: {
    backgroundColor: Colors.white,
    padding: wp(3),
    borderRadius: wp(3),
    marginBottom: hp(2),
  },
  contactTitle: {
    fontSize: wp(5),
    fontFamily: Fonts.bold,
    color: Colors.black,
    marginBottom: hp(2),
    textAlign: 'center',
    fontWeight: 'bold',
  },
  contactIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: wp(10),
    height: wp(10),
    resizeMode: 'contain',
  },
  contactText: {
    marginTop: hp(1),
    fontSize: wp(3.5),
    fontFamily: Fonts.regular,
    color: Colors.gray,
    textAlign: 'center',
  },
  motHistoryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: wp(5),
    marginLeft: wp(2),
  },
  motHistoryText: {
    color: Colors.white,
    fontSize: wp(3),
    fontFamily: Fonts.semiBold,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  webViewHeader: {
    padding: wp(4),
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  webViewHeaderIOS: {
    paddingTop: hp(2),
  },
  closeButton: {
    paddingHorizontal: wp(4),
    paddingVertical: wp(2),
  },
  closeButtonIOS: {
    paddingVertical: wp(3),
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: wp(4),
    fontFamily: Fonts.semiBold,
  },
  webView: {
    flex: 1,
  },
  messageBox: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: wp(3),
    marginBottom: hp(2),
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(2),
    justifyContent: 'space-between',
  },

  amountInputCompact: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: wp(3),
    padding: wp(3),
    fontSize: wp(4),
    fontFamily: Fonts.regular,
    color: Colors.black,
    backgroundColor: '#f9f9f9',
    marginRight: wp(2),
  },

  bidButton: {
    borderColor: Colors.lightGray,
    borderWidth: wp(0.2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },

  bidButtonText: {
    color: Colors.primary,
    fontSize: wp(3.8),
    fontFamily: Fonts.bold,
  },
  errorText: {
    color: 'red',
    fontSize: wp(3.2),
    marginTop: hp(0.5),
    marginBottom: hp(1),
  },
  messageLabel: {
    fontSize: wp(4.5),
    fontFamily: Fonts.semiBold,
    color: Colors.darkGray,
    marginBottom: hp(1),
  },

  textArea: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: wp(3),
    padding: wp(3),
    fontSize: wp(4),
    fontFamily: Fonts.regular,
    color: Colors.black,
    height: hp(15),
    backgroundColor: '#f9f9f9',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: wp(3),
    padding: wp(3),
    fontSize: wp(4),
    fontFamily: Fonts.regular,
    color: Colors.black,
    backgroundColor: '#f9f9f9',
  },

  sendButton: {
    marginTop: hp(2),
    borderWidth: wp(0.2),
    borderColor: Colors.primary,
    paddingVertical: hp(1.5),
    borderRadius: wp(5),
    alignItems: 'center',
  },

  sendButtonText: {
    color: Colors.primary,
    fontSize: wp(4),
    fontFamily: Fonts.bold,
  },
});

export default Details;