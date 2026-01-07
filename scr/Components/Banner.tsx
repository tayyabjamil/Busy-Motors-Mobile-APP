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
  const getAllActiveSubscriptionDetails = () => {
    if (activeSubscriptions.length === 0) {
      return { details: [], hasScrap: false, hasSalvage: false, hasBoth: false };
    }

    const details: any[] = [];
    let hasScrap = false;
    let hasSalvage = false;

    // Check ALL active subscriptions
    activeSubscriptions.forEach((subscriptionId: string) => {
      const activeProduct = revenueCatProducts.find(
        (pkg: any) => pkg.product.identifier === subscriptionId
      );

      if (activeProduct) {
        const identifier = activeProduct.product.identifier.toLowerCase();
        const isScrap = identifier.includes('scrap');
        const isSalvage = identifier.includes('salvage');
        
        if (isScrap) hasScrap = true;
        if (isSalvage) hasSalvage = true;

        let subscriptionType = '';
        if (isScrap) {
          subscriptionType = 'Scrap';
        } else if (isSalvage) {
          subscriptionType = 'Salvage';
        } else {
          subscriptionType = 'Premium';
        }

        details.push({
          name: activeProduct.product.title,
          price: activeProduct.product.price,
          priceString: activeProduct.product.priceString,
          identifier: activeProduct.product.identifier,
          description: activeProduct.product.description,
          type: subscriptionType,
        });
      }
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
  console.log('🔍 isSubscriptionActive:', activeSubscriptionDetails);
  console.log('🔍 hasRevenueCatSubscription:', hasRevenueCatSubscription);
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

  // Promotional banner for non-subscribers - Bold and aggressive
  return (
    <View style={styles.promoBannerContainer}>
      {/* Decorative elements */}
      <View style={styles.promoDecorCircle1} />
      <View style={styles.promoDecorCircle2} />
      <View style={styles.promoDecorStripe} />
      
      <View style={styles.promoContent}>
        {(loading || revenueCatLoading) ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <>
            {/* Discount badge */}
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>🔥 LIMITED OFFER</Text>
            </View>
            
            {/* Main price section */}
            <View style={styles.priceSection}>
              <Text style={styles.promoTitle}>Unlock Premium Access</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceCurrency}>£</Text>
                <Text style={styles.priceAmount}>50</Text>
                <Text style={styles.pricePeriod}>/week</Text>
              </View>
              <Text style={styles.originalPriceText}>
                <Text style={styles.strikeThrough}>£180/month</Text>
                {'  •  '}
                <Text style={styles.saveText}>Save 70%</Text>
              </Text>
            </View>
          </>
        )}
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.promoButton}
        onPress={handleGetNow}
        disabled={loading || revenueCatLoading}
        activeOpacity={0.8}>
        <Text style={styles.promoButtonText}>GET NOW</Text>
        <Text style={styles.promoButtonArrow}>→</Text>
      </TouchableOpacity>
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

  // ============ PROMOTIONAL BANNER (NON-SUBSCRIBER) ============
  promoBannerContainer: {
    backgroundColor: '#E67E22',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    width: '100%',
    ...Shadows.large,
    overflow: 'hidden',
    position: 'relative',
  },
  promoDecorCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  promoDecorCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  promoDecorStripe: {
    position: 'absolute',
    top: 20,
    right: 60,
    width: 4,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    transform: [{rotate: '20deg'}],
  },
  promoContent: {
    zIndex: 1,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  discountText: {
    fontSize: wp(2.8),
    fontFamily: Fonts.bold,
    fontWeight: '800',
    color: '#D35400',
    letterSpacing: 0.8,
  },
  priceSection: {
    marginBottom: Spacing.lg,
  },
  promoTitle: {
    fontSize: wp(5.5),
    fontFamily: Fonts.bold,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  priceCurrency: {
    fontSize: wp(6),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  priceAmount: {
    fontSize: wp(14),
    fontFamily: Fonts.bold,
    fontWeight: '900',
    color: Colors.white,
    lineHeight: wp(15),
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  pricePeriod: {
    fontSize: wp(4.5),
    fontFamily: Fonts.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  originalPriceText: {
    fontSize: wp(3.5),
    fontFamily: Fonts.medium,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  saveText: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    alignSelf: 'flex-start',
    ...Shadows.medium,
    gap: Spacing.sm,
  },
  promoButtonText: {
    fontSize: wp(4.2),
    fontFamily: Fonts.bold,
    fontWeight: '800',
    color: '#D35400',
    letterSpacing: 1.2,
  },
  promoButtonArrow: {
    fontSize: wp(5),
    fontFamily: Fonts.bold,
    fontWeight: '800',
    color: '#D35400',
  },
});

export default Banner;
