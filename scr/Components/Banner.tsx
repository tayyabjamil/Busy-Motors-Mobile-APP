import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
  const {userData} = useSelector((state: any) => state.user);

  // Get active subscriptions from RevenueCat (global check)
  const activeSubscriptions = useSelector(
    (state: any) => state?.subscription?.activeSubscriptions || [],
  );

  const [subscription, setSubscription] = useState(false);
  const [revenueCatProducts, setRevenueCatProducts] = useState<any[]>([]);
  const [, setRevenueCatLoading] = useState(true);
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

  const subscriptionLabel = allSubscriptionData.hasBoth
    ? 'Scrap & Salvage'
    : allSubscriptionData.hasScrap
    ? 'Scrap'
    : allSubscriptionData.hasSalvage
    ? 'Salvage'
    : activeSubscriptions.some((id: string) => id.toLowerCase().includes('scrap'))
    ? 'Scrap'
    : activeSubscriptions.some((id: string) => id.toLowerCase().includes('salvage'))
    ? 'Salvage'
    : 'Premium';

  const hasScrap = allSubscriptionData.hasScrap ||
    activeSubscriptions.some((id: string) => id.toLowerCase().includes('scrap'));
  const hasSalvage = allSubscriptionData.hasSalvage ||
    activeSubscriptions.some((id: string) => id.toLowerCase().includes('salvage'));
  const hasBoth = hasScrap && hasSalvage;

  const subscriptionBadges = hasBoth
    ? ['Scrap', 'Salvage']
    : hasScrap
    ? ['Scrap']
    : hasSalvage
    ? ['Salvage']
    : ['Premium'];

  // Active subscription banner
  if (isSubscriptionActive) {
    return (
      <View style={styles.activeBannerContainer}>
        <View style={styles.activeLeft}>
          <Text style={styles.activeGreeting}>
            Hi, {userData?.first_name || 'User'} 👋
          </Text>
          <Text style={styles.activeSubtitle}>Welcome to Busy Motors</Text>
        </View>
        <View style={styles.badgesRow}>
          {subscriptionBadges.map(label => (
            <TouchableOpacity
              key={label}
              style={styles.activeStatusBadge}
              onPress={() => navigation.navigate('Subscriptions')}>
              <View style={styles.activeDot} />
              <Text style={styles.activeStatus}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Promotional banner for non-subscribers
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerInner}>
        <View style={styles.bannerAccent} />
        <View style={styles.leftSection}>
          <Text style={styles.greetingText}>Unlock Premium Leads</Text>
          <Text style={styles.bannerSubtitle}>
            Access scrap &amp; salvage listings near you
          </Text>
        </View>
        <TouchableOpacity style={styles.getNowButton} onPress={handleGetNow}>
          <Text style={styles.getNowText}>Subscribe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ============ ACTIVE SUBSCRIPTION BANNER ============
  activeBannerContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    marginBottom: hp(1),
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  activeLeft: {
    flex: 1,
  },
  activeGreeting: {
    fontSize: wp(5),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  activeSubtitle: {
    fontSize: wp(3.2),
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  activeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.7),
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  activeStatus: {
    fontSize: wp(3.2),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },

  // ============ PROMO BANNER (NON-SUBSCRIBER) ============
  bannerContainer: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: hp(1),
    ...Shadows.medium,
  },
  bannerInner: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerAccent: {
    position: 'absolute',
    top: -20,
    right: 80,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '30',
  },
  leftSection: {
    flex: 1,
    marginRight: Spacing.md,
  },
  greetingText: {
    fontSize: wp(4.5),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: wp(3.2),
    fontFamily: Fonts.regular,
    color: Colors.white + 'CC',
  },
  getNowButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
  },
  getNowText: {
    fontSize: wp(3.5),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.primary,
  },
  loadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: wp(3.5),
    fontFamily: Fonts.regular,
  },
});

export default Banner;
