import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, TabBar } from 'react-native-tab-view';
import Colors, { Spacing, Shadows, BorderRadius } from '../../Helper/Colors';
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../../Helper/Fonts';
import Purchases from 'react-native-purchases';
import { useDispatch, useSelector } from 'react-redux';
import { checkSubscriptionRequest, setActiveSubscriptions, updateActiveSubscriptions } from '../../redux/slices/subcriptionsSlice';
import Header from '../../Components/Header';

const { width: wp, height: hp } = Dimensions.get('window');


const SubscriptionScreen = () => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const token = useSelector((state) => state.auth?.token);

  const routes = [
    { key: 'scrap', title: 'Scrap' },
    { key: 'salvage', title: 'Salvage' },
  ];

  const [email, setEmail] = useState('tayyabjamil999@gmail.com');
  const [subscriptionSelected, setSubscriptionSelected] = useState('');
  const [selectedActiveSubscription, setSelectedActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salvagePackages, setSalvagePackages] = useState([]);
  const [scrapPackages, setScrapPackages] = useState([]);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const {
    userData,
  } = useSelector((state) => state.user);
  const { cancelSuccess, updateSuccess } = useSelector(
    state => state?.cancelSubscription,
  );
  const activeSubscriptions = useSelector(
    state => state?.subscription?.activeSubscriptions || [],
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (userData) {
      setEmail(userData.email);
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.email) {
      dispatch(checkSubscriptionRequest({ email: userData.email }));
    }
  }, [userData?.email, cancelSuccess, updateSuccess]);
  // Function to refresh active subscriptions
  const refreshActiveSubscriptions = async () => {
    try {
      console.log('🔄 Refreshing active subscriptions...');
      const customerInfo = await Purchases.getCustomerInfo();
      const activeSubs = customerInfo.activeSubscriptions || [];
      dispatch(setActiveSubscriptions(activeSubs));
      console.log('✅ Refreshed active subscriptions:', activeSubs);
      console.log('📊 Full refreshed customer info:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeSubscriptions: customerInfo.activeSubscriptions,
        allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers,
        entitlements: customerInfo.entitlements.active
      });
    } catch (error) {
      console.log('❌ Error refreshing active subscriptions:', error);
    }
  };

  // Check for active subscriptions and save to Redux store
  useEffect(() => {
    const checkActiveSubscriptions = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const activeSubs = customerInfo.activeSubscriptions || [];
        dispatch(setActiveSubscriptions(activeSubs));
        console.log('✅ Active subscriptions found:', activeSubs);
        console.log('📊 Full customer info:', {
          originalAppUserId: customerInfo.originalAppUserId,
          activeSubscriptions: customerInfo.activeSubscriptions,
          allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers,
          entitlements: customerInfo.entitlements.active
        });
      } catch (error) {
        console.log('❌ Error checking active subscriptions:', error);
      }
    };

    checkActiveSubscriptions();
  }, [dispatch]);

  // Fetch RevenueCat products (or use dummy data for testing)
  useEffect(() => {
    const fetchRevenueCatProducts = async () => {
      try {
        console.log('🔄 Fetching RevenueCat offerings...');
        const allOfferings = await Purchases.getOfferings();

        if (allOfferings.current) {
          const packages = allOfferings.current.availablePackages;

          // Filter salvage packages - look for 'salvage' in the identifier
          const salvage = packages.filter(pkg =>
            pkg.product.identifier.toLowerCase().includes('salvage')
          );

          // Filter scrap packages - look for 'scrap' in the identifier and exclude salvage
          const scrap = packages.filter(pkg =>
            pkg.product.identifier.toLowerCase().includes('scrap') &&
            !pkg.product.identifier.toLowerCase().includes('salvage')
          );

          setSalvagePackages(salvage);
          setScrapPackages(scrap);

          console.log('✅ Salvage Packages:', salvage.map(p => p.product.title));
          console.log('✅ Scrap Packages:', scrap.map(p => p.product.title));
          console.log('🔍 All Package Identifiers:', packages.map(p => p.product.identifier));
        } else {
          console.log('❌ No current offering found');
        }
      } catch (error) {
        console.log('❌ Error fetching offerings:', error);
      }
    };

    fetchRevenueCatProducts();
  }, [dispatch]);

  // Handle RevenueCat purchase
  const handlePurchase = async (selectedIdentifier) => {
    try {
      setIsPurchasing(true);
      console.log('🛒 Starting purchase for:', selectedIdentifier);
      
      const allOfferings = await Purchases.getOfferings();
      const availablePackages = allOfferings.current?.availablePackages || [];

      const selectedPackage = availablePackages.find(
        pkg => pkg.product.identifier === selectedIdentifier
      );

      if (!selectedPackage) {
        console.warn('❌ Package not found for identifier:', selectedIdentifier);
        Alert.alert('Error', 'Package not found. Please try again.');
        return;
      }

      console.log('📦 Selected package:', selectedPackage.product.title);
      
      // IMPORTANT: Actually make the purchase with RevenueCat
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      
      console.log('✅ Purchase successful!');
      console.log('📊 Customer info after purchase:', {
        activeSubscriptions: customerInfo.activeSubscriptions,
        entitlements: customerInfo.entitlements.active,
      });

      // Update active subscriptions in Redux store
      dispatch(updateActiveSubscriptions(customerInfo.activeSubscriptions || []));

      // Wait a moment and refresh to ensure we have the latest data
      setTimeout(async () => {
        await refreshActiveSubscriptions();
      }, 1000);

      Alert.alert(
        'Congratulations! 🎉',
        'Your subscription has been successfully activated. Welcome to our premium services. You now have access to all features.',
        [
          {
            text: 'Continue',
            onPress: () => {
              dispatch(checkSubscriptionRequest({ email: userData.email }));
              navigation.goBack();
            },
          },
        ],
        { cancelable: false },
      );

    } catch (error) {
      console.log('❌ Purchase error:', error);

      if (error.userCancelled) {
        console.log('🚫 Purchase cancelled by user');
        // Don't show an alert for user cancellation - it's intentional
      } else {
        Alert.alert('Purchase Failed', error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const renderScene = ({ route }) => {
    const sharedProps = {
      onSelectSubscription: handlePurchase,
      selectedSubscription: subscriptionSelected,
      currentIndex: index,
      setSelectedActiveSubscription: setSelectedActiveSubscription,
      activeSubscriptions: activeSubscriptions,
    };

    switch (route.key) {
      case 'scrap':
        return <ScrapRoute {...sharedProps} products={scrapPackages} />;
      case 'salvage':
        return <SalvageRoute {...sharedProps} products={salvagePackages} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        textData={"Unlock All Features"}
        navigation={navigation}
        showBackButton={true}
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={styles.tabView}
        renderTabBar={props => {
          const activeIndex = props.navigationState.index;

          return (
            <View style={styles.customTabContainer}>
              {props.navigationState.routes.map((route, i) => {
                const isActive = activeIndex === i;

                return (
                  <TouchableOpacity
                    key={route.key}
                    onPress={() => props.jumpTo(route.key)}
                    style={[
                      styles.customTab,
                      isActive && styles.activeTab,      // selected tab
                    ]}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.customTabLabel,
                        isActive && styles.activeTabLabel, // selected text
                      ]}>
                      {route.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        }}
      />
      {subscriptionSelected && subscriptionSelected !== '' ? (
        <>
          {selectedActiveSubscription ? (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => {
                  Alert.alert(
                    'Active Subscription',
                    `You have an active subscription: ${subscriptionSelected}\n\nTo manage your subscription, please go to:\n\n` +
                    'iOS: Settings > Apple ID > Subscriptions\n' +
                    'Android: Google Play Store > Subscriptions',
                    [{ text: 'OK' }],
                  );
                }}>
                <Text style={styles.infoButtonText}>
                  ℹ️ Manage Subscription
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.paymentButtonsContainer}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => handlePurchase(subscriptionSelected)}
                disabled={isPurchasing}>
                <Text style={styles.continueText}>
                  {isPurchasing ? 'Processing...' : 'Subscribe Now'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : null}

      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {/* Active Subscriptions Display */}

    </SafeAreaView>
  );
};

const SalvageRoute = ({
  onSelectSubscription,
  products = [],
  selectedSubscription,
  currentIndex,
  setSelectedActiveSubscription,
  activeSubscriptions = [],
}) => {
  const { subscriptions = [] } = useSelector(
    state => state?.subscription?.subscriptionData || {},
  );

  const handleSubscriptionSelect = (packageIdentifier) => {
    setSelectedActiveSubscription(false);
    onSelectSubscription(packageIdentifier);
  };

  // Check if a subscription is active
  const isSubscriptionActive = (productIdentifier) => {
    const isActive = activeSubscriptions.includes(productIdentifier);
    console.log(`🔍 SALVAGE - Checking if ${productIdentifier} is active:`, isActive);
    console.log(`📋 SALVAGE - All active subscriptions:`, activeSubscriptions);
    console.log(`🔍 SALVAGE - Product identifier being checked:`, productIdentifier);
    console.log(`🔍 SALVAGE - Active subscriptions array:`, activeSubscriptions);
    console.log(`🔍 SALVAGE - Is included?`, activeSubscriptions.includes(productIdentifier));
    return isActive;
  };

  console.log('🔄 SALVAGE ROUTE - Products:', products.map(p => p.product.identifier));
  console.log('🔄 SALVAGE ROUTE - Active subscriptions:', activeSubscriptions);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.tabContent}>
        <View style={styles.subContainer}>
          <Text style={styles.subHeader}>Salvage Monthly Subscription:</Text>
          <Text style={styles.description}>
            Find salvaged cars at competitive prices.
          </Text>
          <Text style={styles.description}>
            Connect with sellers offload vehicles.
          </Text>
          <Text style={styles.description}>
            Expand your inventory with unique opportunities.
          </Text>
        </View>

        <View style={styles.tabContainer}>
          {products
            .filter(
              pkg =>
                !pkg.product.identifier.toLowerCase().includes('corporate') &&
                !pkg.product.title.toLowerCase().includes('corporate'),
            )
            .map((pkg, index) => {
              const isActive = isSubscriptionActive(pkg.product.identifier);
              console.log(`🎯 SALVAGE - Package ${pkg.product.identifier} active:`, isActive);
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  onPress={() => handleSubscriptionSelect(pkg.product.identifier)}
                  style={[
                    styles.optionSelected,
                    selectedSubscription === pkg.product.identifier
                      ? styles.optionFocused
                      : styles.optionDisabled,
                  ]}>
                  <Image
                    source={require('../../assets/loyalty.png')}
                    style={styles.optionImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.optionText}>{pkg.product.title}</Text>

                  <Text style={styles.optionSubText}>{pkg.product.priceString}</Text>
                  <Text style={styles.helperText}>
                    {pkg.product.identifier.includes('weekly') ? '7 days access' : '1 month access'}
                  </Text>
                  <View style={styles.linksContainer}>
                    <Text
                      style={styles.linkText}
                      onPress={() =>
                        Linking.openURL('https://scrape4you.onrender.com/terms')
                      }>
                      Terms and Conditions
                    </Text>
                    <Text
                      style={styles.linkText}
                      onPress={() =>
                        Linking.openURL(
                          'https://scrape4you.onrender.com/privacy-policy',
                        )
                      }>
                      Privacy Policy
                    </Text>
                  </View>
                  {isActive && (
                    <View style={styles.activeOverlay}>
                      <Text style={styles.activeText}>Active</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
        </View>
      </View>
    </ScrollView>
  );
};

const ScrapRoute = ({
  products = [],
  onSelectSubscription,
  selectedSubscription,
  currentIndex,
  setSelectedActiveSubscription,
  activeSubscriptions = [],
}) => {
  const { subscriptions = [] } = useSelector(
    state => state?.subscription?.subscriptionData || {},
  );

  const handleSubscriptionSelect = (packageIdentifier) => {
    setSelectedActiveSubscription(false);
    onSelectSubscription(packageIdentifier);
  };

  // Check if a subscription is active
  const isSubscriptionActive = (productIdentifier) => {
    return activeSubscriptions.includes(productIdentifier);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.tabContent}>
        <View style={styles.subContainer}>
          <Text style={styles.subHeader}>Scrap Monthly Subscription:</Text>
          <Text style={styles.description}>
            Access a curated list of car sellers.
          </Text>
          <Text style={styles.description}>
            Get real-time updates on vehicles.
          </Text>
          <Text style={styles.description}>
            Contact sellers directly to negotiate and close deals.
          </Text>
        </View>

        <View style={styles.tabContainer}>
          {products
            .filter(
              pkg =>
                !pkg.product.identifier.toLowerCase().includes('corporate') &&
                !pkg.product.title.toLowerCase().includes('corporate'),
            )
            .map((pkg, index) => {
              const isActive = isSubscriptionActive(pkg.product.identifier);
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  onPress={() => handleSubscriptionSelect(pkg.product.identifier)}
                  style={[
                    styles.optionSelected,
                    selectedSubscription === pkg.product.identifier
                      ? styles.optionFocused
                      : styles.optionDisabled,
                  ]}>
                  <Image
                    source={require('../../assets/loyalty.png')}
                    style={styles.optionImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.optionText}>{pkg.product.title}</Text>
                  <Text style={styles.optionSubText}>{pkg.product.priceString}</Text>
                  <Text style={styles.helperText}>
                    {pkg.product.identifier.includes('weekly') ? '7 days access' : '1 month access'}
                  </Text>
                  <View style={styles.linksContainer}>
                    <Text
                      style={styles.linkText}
                      onPress={() =>
                        Linking.openURL('https://scrape4you.onrender.com/terms')
                      }>
                      Terms and Conditions
                    </Text>
                    <Text
                      style={styles.linkText}
                      onPress={() =>
                        Linking.openURL(
                          'https://scrape4you.onrender.com/privacy-policy',
                        )
                      }>
                      Privacy Policy
                    </Text>
                  </View>

                  {isActive && (
                    <View style={styles.activeOverlay}>
                      <Text style={styles.activeText}>Active</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    paddingTop: hp * 0.01

  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  tabView:{
    paddingTop: hp * 0.03,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp * 0.03,
  },
  tabContent: {
    paddingHorizontal: wp * 0.05,
    paddingTop: hp * 0.03,
  },
  subHeader: {
    fontSize: wp * 0.055,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.white,
    paddingBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: wp * 0.038,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: Spacing.xs,
    lineHeight: wp * 0.055,
  },
  tabContainer: {
    marginTop: wp * 0.05,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  optionSelected: {
    width: wp / 2.4,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    height: hp / 4.2,
    padding: Spacing.base,
    position: 'relative',
    ...Shadows.large,
    borderWidth: 2,
    borderColor: Colors.lightGray,
  },
  subContainer: {
    backgroundColor: Colors.backgroundDark,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  optionFocused: {
    borderWidth: 3,
    borderColor: Colors.primary,
    ...Shadows.large,
    transform: [{ scale: 1.02 }],
  },
  optionDisabled: {
    backgroundColor: Colors.white,
    opacity: 1,
    borderWidth: 2,
    borderColor: Colors.lightGray,
  },
  optionImage: {
    width: wp * 0.12,
    height: wp * 0.12,
    tintColor: Colors.primary,
    marginBottom: Spacing.sm,
  },
  optionText: {
    marginTop: Spacing.sm,
    fontSize: wp * 0.04,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  sharingText: {
    marginTop: wp * 0.01,
    fontSize: wp * 0.033,
    fontFamily: Fonts.regular,
    color: Colors.footerGray,
  },
  sharingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: wp * 0.01,
    paddingLeft: 5,
  },
  phoneIcon: {
    width: wp * 0.04,
    height: wp * 0.04,
    marginLeft: wp * 0.01,
    resizeMode: 'contain',
  },
  optionSubText: {
    marginTop: Spacing.xs,
    fontSize: wp * 0.045,
    fontFamily: Fonts.bold,
    fontWeight: '800',
    color: Colors.primary,
  },
  helperText: {
    fontSize: wp * 0.032,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: wp * 0.02,
    flexWrap: 'wrap',
  },
  linkText: {
    fontSize: wp * 0.028,
    fontFamily: Fonts.regular,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    fontSize: wp * 0.028,
    color: Colors.footerGray,
    marginHorizontal: wp * 0.01,
  },
  customTabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.round,
    marginHorizontal: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.lightGray,
    ...Shadows.medium,
  },

  customTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
  },

  customTabLabel: {
    fontSize: wp * 0.04,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  activeTabLabel: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    textAlign: 'center',
  },

  tabIndicator: {
    backgroundColor: Colors.primary,
    height: 3,
  },
  continueButton: {
    width: '100%',
    padding: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 10,
  },
  continueText: {
    color: Colors.white,
    fontSize: wp * 0.045,
    fontFamily: Fonts.bold,
  },
  paymentButtonsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp * 0.05,
    marginVertical: hp * 0.02,
    marginBottom: hp * 0.01,
  },
  deleteButton: {
    width: '100%',
    paddingVertical: hp * 0.015,
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF3B30',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: wp * 0.038,
    fontFamily: Fonts.semiBold,
  },
  activeOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    ...Shadows.medium,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeText: {
    color: Colors.white,
    fontSize: wp * 0.028,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  debugContainer: {
    backgroundColor: Colors.lightGray,
    padding: 10,
    alignItems: 'center',
    marginTop: hp * 0.02,
  },
  debugText: {
    fontSize: wp * 0.035,
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
  debugButton: {
    marginTop: 10,
    paddingVertical: hp * 0.01,
    paddingHorizontal: wp * 0.1,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  debugButtonText: {
    color: Colors.white,
    fontSize: wp * 0.035,
    fontFamily: Fonts.bold,
  },
  activeSubscriptionsContainer: {
    backgroundColor: Colors.lightGray,
    padding: 15,
    marginTop: hp * 0.02,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  activeSubscriptionsTitle: {
    fontSize: wp * 0.045,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  activeSubscriptionItem: {
    fontSize: wp * 0.038,
    fontFamily: Fonts.regular,
    color: Colors.black,
    marginBottom: 5,
  },
  infoButton: {
    width: '100%',
    paddingVertical: hp * 0.015,
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  infoButtonText: {
    color: Colors.primary,
    fontSize: wp * 0.038,
    fontFamily: Fonts.semiBold,
  },
});

export default SubscriptionScreen;
