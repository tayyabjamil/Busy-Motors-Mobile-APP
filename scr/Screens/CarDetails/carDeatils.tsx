import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {hp, wp} from '../../Helper/Responsive';
import Colors from '../../Helper/Colors';
import Header from '../../Components/Header';
import Banner from '../../Components/Banner';
import {Fonts} from '../../Helper/Fonts';
import {useDispatch, useSelector} from 'react-redux';
import WebView from 'react-native-webview';
import {resetQuoteState, sendQuoteRequest} from '../../redux/slices/qouteSlice';
import Toast from 'react-native-simple-toast';
import {navigationRef} from '../../navigationRef';

const defaultCarImage = require('../../assets/car2.png');
const {width: SCREEN_WIDTH} = Dimensions.get('window');

const Details = ({route}: any) => {
  const dispatch = useDispatch();
  const {car} = route.params;
  const insets = useSafeAreaInsets();

  // Get active subscriptions from RevenueCat (global check)
  const activeSubscriptions = useSelector(
    (state: any) => state?.subscription?.activeSubscriptions || [],
  );

  // Check if user has any active subscriptions
  const hasActiveSubscription = activeSubscriptions.length > 0;

  const {userData} = useSelector((state: any) => state.user);
  const token = useSelector((state: any) => state.auth?.token);
  const qoute = useSelector((state: any) => state?.quote);
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState({
    messageError: '',
    amountError: '',
  });
  const [showMessageBottomSheet, setShowMessageBottomSheet] = useState(false);
  
  // Dummy data for missing fields
  const carData = {
    name: car?.make && car?.model ? `${car.make} ${car.model}` : 'dummy Classic Mustang',
    price: car?.price || 'dummy $35,000',
    maxSpeed: car?.maxSpeed || 'dummy 200 M/h',
    age: car?.age || car?.yearOfManufacture ? `${new Date().getFullYear() - parseInt(car.yearOfManufacture)} years` : 'dummy 4 years',
    fuel: car?.fuelType || 'dummy Diesel',
    power: car?.engineCapacity + ' cc' || '',
    motStatus: car?.motStatus || 'N/A',
    transmission: car?.transmission || 'dummy Automatic',
    description: car?.description || 'dummy Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  };

  console.log('car', car);

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
    let newErrors = {messageError: '', amountError: ''};

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
      (sendQuoteRequest as any)({
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
      setError(prev => ({...prev, amountError: 'Please enter an amount'}));
      return;
    }

    // You can optionally give feedback like toast or log
    console.log('Bid Placed with Amount:', amount);
    Toast.show(`Bid placed: ₹${amount}`, Toast.SHORT);
  };

  const handleCall = (phoneNumber: string) => {
    if (!hasActiveSubscription) {
      showSubscriptionAlert();
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleTextMessage = (phoneNumber: string) => {
    if (!hasActiveSubscription) {
      showSubscriptionAlert();
      return;
    }
    Linking.openURL(`sms:${phoneNumber}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    if (!hasActiveSubscription) {
      showSubscriptionAlert();
      return;
    }
    Linking.openURL(`https://wa.me/${phoneNumber}`);
  };

  const handleMotHistory = () => {
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
          onPress: () => {
            if (navigationRef.isReady()) {
              (navigationRef as any).navigate('Subscriptions');
            }
          },
          style: 'default',
        },
      ],
      {cancelable: true},
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleMessageSeller = () => {
    setShowMessageBottomSheet(true);
  };

  const handleGetNow = () => {
    // Handle Get Now action
    Toast.show('Get Now clicked', Toast.SHORT);
  };

  const specifications = [
    {
      label: 'Max Speed',
      value: carData.maxSpeed,
      icon: require('../../assets/speedometer.png'),
    },
    {
      label: 'Mot Status',
      value: carData?.motStatus || 'N/A',
      icon: require('../../assets/dashboard.png'),
    },
    {
      label: 'Age',
      value: carData.age,
      icon: require('../../assets/timer.png'),
    },
    {
      label: 'Fuel',
      value: carData.fuel,
      icon: require('../../assets/Fuel.png'),
    },
    {
      label: 'Engine Capacity',
      value: carData.power,
      icon: require('../../assets/dashboard.png'),
    },
    {
      label: 'Postcode',
      value: car?.postcode
        ? car.postcode.toString().substring(0, 3).toUpperCase() + '..'
        : 'N/A',
      icon: require('../../assets/dashboard.png'),
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
      <Header navigation={navigationRef} showNotification={false} {...({textData: 'Car Details'} as any)} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Car Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              car?.displayImage && car?.displayImage !== 'N/A'
                ? {uri: car?.displayImage}
                : defaultCarImage
            }
            style={styles.carImage}
            resizeMode="cover"
          />
        </View>

        {/* Car Name and Price Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.carName}>{carData.name}</Text>
            <TouchableOpacity style={styles.heartButton}>
              <Image
                source={require('../../assets/heart.png')}
                style={styles.heartIcon}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.carPrice}>{carData.price}</Text>
        </View>

        {/* Specifications Grid */}
        <View style={styles.specsContainer}>
          {specifications.map((spec, index) => (
            <View key={index} style={styles.specCard}>
              <Image
                source={spec.icon}
                style={[
                  styles.specIcon,
                  spec.label === 'Fuel' && styles.fuelIcon,
                ]}
                tintColor={spec.label === 'Fuel' ? Colors.black : undefined}
              />
              <Text style={styles.specLabel}>{spec.label}</Text>
              <Text style={styles.specValue}>{spec.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons - Fixed at Bottom */}
      <View
        style={[
          styles.bottomButtonsWrapper,
          {paddingBottom: Math.max(insets.bottom, hp(1))},
        ]}>
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessageSeller}
            activeOpacity={0.8}>
            <Text style={styles.messageButtonText}>Message seller</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.getNowButton}
            onPress={handleGetNow}
            activeOpacity={0.8}>
            <Text style={styles.getNowButtonText}>Get now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Message Seller Bottom Sheet */}
      <Modal
        visible={showMessageBottomSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMessageBottomSheet(false)}>
        <TouchableOpacity
          style={styles.bottomSheetOverlay}
          activeOpacity={1}
          onPress={() => setShowMessageBottomSheet(false)}>
          <View
            style={styles.bottomSheetContent}
            onStartShouldSetResponder={() => true}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Contact Seller</Text>
            <Text style={styles.bottomSheetSubtitle}>
              You can contact the seller using any of the following options:
            </Text>
            <View style={styles.contactOptionsContainer}>
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
                const opacityStyle = {opacity: isSold ? 0.3 : 1};

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.bottomSheetContactButton,
                      opacityStyle,
                    ]}
                    onPress={() => {
                      if (!isSold) {
                        setShowMessageBottomSheet(false);
                        action('+' + car?.phoneNumber);
                      }
                    }}
                    activeOpacity={isSold ? 1 : 0.7}
                    disabled={isSold}>
                    <Image source={icon} style={styles.bottomSheetIcon} />
                    <Text style={styles.bottomSheetContactText}>{text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MOT History WebView Modal */}
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
            source={{uri: webViewUrl}}
            style={styles.webView}
            startInLoadingState={true}
            onError={syntheticEvent => {
              console.error('WebView error:', syntheticEvent.nativeEvent);
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer:{
    paddingHorizontal:13
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(10),
  },
  imageContainer: {
    width: '100%',
    height: hp(30),
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(1),
    backgroundColor: Colors.white,
  },
  carImage: {
    width: '100%',
    height: '100%',
    borderRadius: wp(4),
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  titleSection: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(1),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  carName: {
    fontSize: wp(6),
    fontFamily: Fonts.bold,
    fontWeight:'500',
    color: Colors.black,
    flex: 1,
  },
  heartButton: {
    padding: wp(1),
  },
  heartIcon: {
    width: wp(7),
    height: wp(7),
    resizeMode: 'contain',
  },
  carPrice: {
    fontSize: wp(5.5),
    fontFamily: Fonts.bold,
    color: Colors.primary,
 
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    justifyContent: 'space-between',
  },
  specCard: {
    width: (SCREEN_WIDTH - wp(6) - wp(8)) / 3,
    backgroundColor: '#f8f8f8',
    borderRadius: wp(3),
    padding: wp(2.5),
    alignItems: 'center',
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: Colors.lightGray,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  specIcon: {
    width: wp(5),
    height: wp(5),
    resizeMode: 'contain',
    marginBottom: hp(1),
    color:'black'
  },
  fuelIcon: {
    tintColor: Colors.black,
  },
  specLabel: {
    fontSize: wp(3.5),
    fontFamily: Fonts.regular,
    color: Colors.black,
    marginBottom: hp(0.5),
    textAlign: 'center',
  },
  specValue: {
    fontSize: wp(3),
    fontFamily: Fonts.semiBold,
    color: Colors.gray,
    textAlign: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  descriptionTitle: {
    fontSize: wp(5),
    fontFamily: Fonts.bold,
    color: Colors.black,
    marginBottom: hp(1.5),
  },
  descriptionText: {
    fontSize: wp(4),
    fontFamily: Fonts.regular,
    color: Colors.gray,
    lineHeight: hp(2.5),
  },
  bottomButtonsWrapper: {
    backgroundColor: Colors.white,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
    paddingBottom: hp(1.5),
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    gap: wp(3),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  messageButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: wp(2.5),
    paddingVertical: hp(1),
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(6),
  },
  messageButtonText: {
    fontSize: wp(4),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  getNowButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: wp(2.5),
    paddingVertical: hp(1),
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(6),
  },
  getNowButtonText: {
    fontSize: wp(4),
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  // Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    paddingTop: hp(2),
    paddingBottom: Platform.OS === 'ios' ? hp(4) : hp(2),
    paddingHorizontal: wp(5),
    maxHeight: hp(50),
  },
  bottomSheetHandle: {
    width: wp(15),
    height: hp(0.5),
    backgroundColor: Colors.lightGray,
    borderRadius: wp(1),
    alignSelf: 'center',
    marginBottom: hp(2),
  },
  bottomSheetTitle: {
    fontSize: wp(5.5),
    fontFamily: Fonts.bold,
    color: Colors.black,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  bottomSheetSubtitle: {
    fontSize: wp(4),
    fontFamily: Fonts.regular,
    color: Colors.gray,
    marginBottom: hp(3),
    textAlign: 'center',
    lineHeight: hp(2.5),
  },
  contactOptionsContainer: {
    gap: hp(2),
  },
  bottomSheetContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: wp(3),
    padding: wp(4),
    gap: wp(3),
  },
  bottomSheetIcon: {
    width: wp(8),
    height: wp(8),
    resizeMode: 'contain',
  },
  bottomSheetContactText: {
    fontSize: wp(4.5),
    fontFamily: Fonts.semiBold,
    color: Colors.black,
  },
  // WebView Modal Styles
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
});

export default Details;
