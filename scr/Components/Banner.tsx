import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Colors, {Spacing, Shadows, BorderRadius} from '../Helper/Colors';
import {hp, wp} from '../Helper/Responsive';
import {Fonts} from '../Helper/Fonts';
import {checkSubscriptionRequest} from '../redux/slices/subcriptionsSlice';
import Purchases from 'react-native-purchases';
import Toast from 'react-native-simple-toast';

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

  // Get active subscription details from RevenueCat
  const getActiveSubscriptionDetails = () => {
    if (activeSubscriptions.length === 0) {
      return null;
    }

    // Get the first active subscription
    const activeSubscriptionId = activeSubscriptions[0];
    
    // Find the product details from RevenueCat products
    const activeProduct = revenueCatProducts.find(
      (pkg: any) => pkg.product.identifier === activeSubscriptionId
    );

    if (activeProduct) {
      // Determine subscription type based on identifier
      const isScrap = activeProduct.product.identifier.toLowerCase().includes('scrap');
      const isSalvage = activeProduct.product.identifier.toLowerCase().includes('salvage');
      
      let subscriptionType = '';
      if (isScrap) {
        subscriptionType = 'Scrap';
      } else if (isSalvage) {
        subscriptionType = 'Salvage';
      } else {
        subscriptionType = 'Premium';
      }

      return {
        name: activeProduct.product.title,
        price: activeProduct.product.price,
        priceString: activeProduct.product.priceString,
        identifier: activeProduct.product.identifier,
        description: activeProduct.product.description,
        type: subscriptionType,
      };
    }

    return null;
  };

  const activeSubscriptionDetails = getActiveSubscriptionDetails();
  const hasRevenueCatSubscription = activeSubscriptions.length > 0;

  // Get active subscription from old data as fallback
  const activeSubscription = subscriptions.find((sub: any) => sub.status === 'active');

  // Use RevenueCat subscription if available, otherwise fall back to old data
  const subscriptionName = activeSubscriptionDetails?.name || 
    (activeSubscription?.plan?.name === 'Unknown Plan' ? 'Corporate Plan' : activeSubscription?.plan?.name || 'Premium Plan');
  
  const subscriptionPrice = activeSubscriptionDetails?.price || activeSubscription?.plan?.price || 300;
  const subscriptionPriceString = activeSubscriptionDetails?.priceString || `£${subscriptionPrice}`;
  
  const subscriptionInterval = activeSubscriptionDetails?.identifier?.includes('weekly') ? 'week' : 
    (activeSubscription?.plan?.interval === 'N/A' ? 'monthly' : activeSubscription?.plan?.interval || 'month');

  // Get subscription type for display
  const subscriptionType = activeSubscriptionDetails?.type || 'Premium';

  let isSubscriptionActive = hasRevenueCatSubscription || subscription;

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
            <Text style={styles.greetingText}>
              {isSubscriptionActive
                ? `Hi, ${userData?.first_name || 'User'}`
                : 'Start from £50/week'}
            </Text>
            {isSubscriptionActive && (
              <Text style={styles.subscriptionBadge}>{subscriptionName}</Text>
            )}
            {!isSubscriptionActive && (
              <Text style={styles.originalPrice}>£180/Monthly</Text>
            )}
          </>
        )}
      </View>

      {/* Right Section: Bell Icon & Button */}
      <View style={styles.rightSection}>

        {!isSubscriptionActive && (
          <TouchableOpacity
            style={styles.getNowButton}
            onPress={() => navigation.navigate('Subscriptions')}
            disabled={loading || revenueCatLoading}>
            <Text style={styles.getNowText}>Get Now</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.bellContainer}
          onPress={() => {
            if (userData?.is_guest) {
              Toast.show('Please log in to access notifications', Toast.LONG);
            } else {
              navigation.navigate('Notifications');
            }
          }}>
          <Image
            source={require('../assets/bellEmpty.png')}
            style={styles.bellIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  subscriptionBadge: {
    fontSize: wp(3.2),
    fontFamily: Fonts.medium,
    color: Colors.accent,
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
  bellContainer: {
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  bellIcon: {
    width: wp(5),
    height: wp(5),
    resizeMode: 'contain',
    tintColor: Colors.textSecondary,
  },
  getNowButton: {
    backgroundColor: Colors.accent,
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
