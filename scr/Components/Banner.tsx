import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Colors, {Spacing, Shadows, BorderRadius} from '../Helper/Colors';
import {hp, wp} from '../Helper/Responsive';
import {Fonts} from '../Helper/Fonts';
import {checkSubscriptionRequest} from '../redux/slices/subcriptionsSlice';
import {logout} from '../redux/slices/authSlice';
import Purchases from 'react-native-purchases';
import Toast from 'react-native-simple-toast';
import {navigationRef} from '../navigationRef';

const Banner = ({navigation}: {navigation: any}) => {
  const {hasSubscription, subscriptions = []} = useSelector(
    (state: any) => state?.subscription?.subscriptionData || {},
  );
  const loading = useSelector((state: any) => state?.subscription?.loading);
  const {userData} = useSelector((state: any) => state.user);

  // Get active subscriptions from RevenueCat (global check)
  const activeSubscriptions = useSelector(
    (state: any) => state?.subscription?.activeSubscriptions || [],
  );

  const [subscription, setSubscription] = useState(false);
  const [revenueCatProducts, setRevenueCatProducts] = useState<any[]>([]);
  const [revenueCatLoading, setRevenueCatLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    if (userData?.email) {
      dispatch(checkSubscriptionRequest({email: userData?.email}));
    }
    setSubscription(hasSubscription);
  }, [userData?.email, hasSubscription]);

  // Fetch RevenueCat products for subscription details
  useEffect(() => {
    const fetchRevenueCatProducts = async () => {
      try {
        setRevenueCatLoading(true);
        const allOfferings = await Purchases.getOfferings();
        
        if (allOfferings.current) {
          const packages = allOfferings.current.availablePackages;
          setRevenueCatProducts(packages);
        }
      } catch (error) {
        console.log('❌ Error fetching RevenueCat products:', error);
      } finally {
        setRevenueCatLoading(false);
      }
    };

    fetchRevenueCatProducts();
  }, []);

  // Get ALL active subscription details from RevenueCat (handles multiple subscriptions)
  // Now detects subscription type directly from ID without needing product details
  const getAllActiveSubscriptionDetails = () => {
    if (activeSubscriptions.length === 0) {
      return { details: [], hasScrap: false, hasSalvage: false, hasBoth: false };
    }

    const details: any[] = [];
    let hasScrap = false;
    let hasSalvage = false;

    // Check ALL active subscriptions - detect type directly from subscription ID
    activeSubscriptions.forEach((subscriptionId: string) => {
      const identifier = subscriptionId.toLowerCase();
      const isScrap = identifier.includes('scrap');
      const isSalvage = identifier.includes('salvage');
      
      if (isScrap) hasScrap = true;
      if (isSalvage) hasSalvage = true;

      // Try to find product details if available
      const activeProduct = revenueCatProducts.find(
        (pkg: any) => pkg.product.identifier === subscriptionId
      );

      let subscriptionType = '';
      if (isScrap) {
        subscriptionType = 'Scrap';
      } else if (isSalvage) {
        subscriptionType = 'Salvage';
      } else {
        subscriptionType = 'Premium';
      }

      details.push({
        name: activeProduct?.product?.title || subscriptionType + ' Subscription',
        price: activeProduct?.product?.price || 0,
        priceString: activeProduct?.product?.priceString || '',
        identifier: subscriptionId,
        description: activeProduct?.product?.description || '',
        type: subscriptionType,
      });
    });

    return { details, hasScrap, hasSalvage, hasBoth: hasScrap && hasSalvage };
  };

  const allSubscriptionData = getAllActiveSubscriptionDetails();
  const activeSubscriptionDetails = allSubscriptionData.details?.[0] || null;
  const hasRevenueCatSubscription = activeSubscriptions.length > 0;

  // Get active subscription from old data as fallback
  const activeSubscription = subscriptions.find((sub: any) => sub.status === 'active');

  // Build subscription name - show combined if user has both
  const getSubscriptionName = () => {
    if (allSubscriptionData.hasBoth) {
      return 'Scrap & Salvage';
    }
    if (activeSubscriptionDetails?.name) {
      return activeSubscriptionDetails.name;
    }
    if (activeSubscription?.plan?.name === 'Unknown Plan') {
      return 'Corporate Plan';
    }
    return activeSubscription?.plan?.name || 'Premium Plan';
  };

  const subscriptionName = getSubscriptionName();
  
  const subscriptionPrice = activeSubscriptionDetails?.price || activeSubscription?.plan?.price || 300;
  const subscriptionPriceString = activeSubscriptionDetails?.priceString || `£${subscriptionPrice}`;
  
  const subscriptionInterval = activeSubscriptionDetails?.identifier?.includes('weekly') ? 'week' : 
    (activeSubscription?.plan?.interval === 'N/A' ? 'monthly' : activeSubscription?.plan?.interval || 'month');

  // Get subscription type for display
  const getSubscriptionType = () => {
    if (allSubscriptionData.hasBoth) {
      return 'Scrap & Salvage';
    }
    return activeSubscriptionDetails?.type || 'Premium';
  };
  
  const subscriptionType = getSubscriptionType();

  let isSubscriptionActive = hasRevenueCatSubscription || subscription;
  
  // DEBUG: Log all subscription data to identify the issue
  console.log('🔍 ========== BANNER SUBSCRIPTION DEBUG ==========');
  console.log('🔍 activeSubscriptions (from Redux):', activeSubscriptions);
  console.log('🔍 activeSubscriptions length:', activeSubscriptions.length);
  console.log('🔍 allSubscriptionData:', allSubscriptionData);
  console.log('🔍 hasScrap:', allSubscriptionData.hasScrap);
  console.log('🔍 hasSalvage:', allSubscriptionData.hasSalvage);
  console.log('🔍 hasBoth:', allSubscriptionData.hasBoth);
  console.log('🔍 isSubscriptionActive:', isSubscriptionActive);
  console.log('🔍 hasRevenueCatSubscription:', hasRevenueCatSubscription);
  console.log('🔍 ================================================');
  
  const isGuest = userData?.is_guest === true;

  // Handle Get Now button press
  const handleGetNow = () => {
    if (isGuest) {
      Alert.alert(
        'Create Account',
        'Please create an account to purchase a subscription and unlock all premium features.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Up',
            onPress: () => {
              dispatch(logout());
              // Navigate to AuthStack first, then to Register
              navigationRef.current?.reset({
                index: 0,
                routes: [
                  {
                    name: 'AuthStack',
                    state: {
                      routes: [{name: 'Register'}],
                    },
                  },
                ],
              });
            },
          },
        ],
      );
      return;
    }
    navigation.navigate('Subscriptions');
  };

  // Render different banners based on subscription status
  if (isSubscriptionActive) {
    // Active subscription banner - Clean and elegant
    return (
      <View style={styles.activeBannerContainer}>
        {/* Background accent */}
        <View style={styles.activeAccentBar} />
        
        <View style={styles.activeLeftSection}>
          {(loading || revenueCatLoading) ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Text style={styles.activeGreeting}>
                Hi, {userData?.first_name || 'User'} 👋
              </Text>
              <View style={styles.activeBadgeContainer}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>{subscriptionType}</Text>
                </View>
                <Text style={styles.activeStatus}>Active Member</Text>
              </View>
            </>
          )}
        </View>
        <TouchableOpacity
          style={styles.activeBellContainer}
          onPress={() => {
            if (userData?.is_guest) {
              Toast.show('Please log in to access notifications', Toast.LONG);
            } else {
              navigation.navigate('Notifications');
            }
          }}>
          <Image
            source={require('../assets/bellEmpty.png')}
            style={styles.activeBellIcon}
          />
        </TouchableOpacity>
      </View>
    );
  }

  // Promotional banner for non-subscribers - Simple and clean
  return (
    <View style={styles.bannerContainer}>
      {/* Left Section: Text and Price */}
      <View style={styles.leftSection}>
        {(loading || revenueCatLoading) ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="small" color={Colors.accent} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.greetingText}>Start from £50/week</Text>
            <Text style={styles.originalPrice}>£180/Monthly</Text>
          </>
        )}
      </View>

      {/* Right Section: Button */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.getNowButton}
          onPress={handleGetNow}
          disabled={loading || revenueCatLoading}>
          <Text style={styles.getNowText}>Get Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ============ ACTIVE SUBSCRIPTION BANNER ============
  activeBannerContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A3A5C',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    ...Shadows.large,
    overflow: 'hidden',
    position: 'relative',
  },
  activeAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#27AE60',
    borderTopLeftRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.xl,
  },
  activeLeftSection: {
    flex: 1,
    paddingLeft: Spacing.sm,
  },
  activeGreeting: {
    fontSize: wp(4.5),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  activeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  activeBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.3)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(39, 174, 96, 0.5)',
  },
  activeBadgeText: {
    fontSize: wp(3),
    fontFamily: Fonts.bold,
    fontWeight: '600',
    color: '#27AE60',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeStatus: {
    fontSize: wp(3),
    fontFamily: Fonts.medium,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeBellContainer: {
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  activeBellIcon: {
    width: wp(5.5),
    height: wp(5.5),
    resizeMode: 'contain',
    tintColor: Colors.white,
  },

  // ============ SIMPLE BANNER (NON-SUBSCRIBER) ============
  bannerContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    width: '100%',
  },
  loadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  leftSection: {
    flex: 1,
    marginRight: Spacing.md,
  },
  greetingText: {
    fontSize: wp(4.2),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  originalPrice: {
    fontSize: wp(3.2),
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  getNowButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    ...Shadows.small,
  },
  getNowText: {
    fontSize: wp(3.5),
    fontFamily: Fonts.bold,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: wp(3.5),
    fontFamily: Fonts.regular,
  },
});

export default Banner;
