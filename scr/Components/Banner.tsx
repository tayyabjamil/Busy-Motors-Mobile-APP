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

  // Active subscription banner
  if (isSubscriptionActive) {
    return (
      <View style={styles.activeBannerContainer}>
        <View>
          <Text style={styles.activeGreeting}>
            Hi, {userData?.first_name || 'User'} 👋
          </Text>
          <Text style={styles.activeSubtitle}>
            Welcome to Busy Motors
          </Text>
        </View>
        <TouchableOpacity
          style={styles.activeStatusBadge}
          onPress={() => navigation.navigate('Subscriptions')}>
          <Text style={styles.activeStatus}>
            {allSubscriptionData.hasBoth ? 'Scrap & Salvage' : allSubscriptionData.hasScrap ? 'Scrap' : 'Salvage'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Promotional banner for non-subscribers
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.leftSection}>
        <Text style={styles.greetingText}>Unlock Car Leads</Text>
        <Text style={styles.bannerSubtitle}>
          Access scrap & salvage listings near you
        </Text>
      </View>
      <TouchableOpacity style={styles.getNowButton} onPress={handleGetNow}>
        <Text style={styles.getNowText}>Subscribe</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // ============ ACTIVE SUBSCRIPTION BANNER ============
  activeBannerContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  activeGreeting: {
    fontSize: wp(4.5),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  activeSubtitle: {
    fontSize: wp(3.2),
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  activeStatusBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  activeStatus: {
    fontSize: wp(3),
    fontFamily: Fonts.medium,
    color: Colors.white,
  },
  activeBellIcon: {
    width: wp(5.5),
    height: wp(5.5),
    resizeMode: 'contain',
    tintColor: Colors.textPrimary,
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
  bannerSubtitle: {
    fontSize: wp(3.2),
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
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
