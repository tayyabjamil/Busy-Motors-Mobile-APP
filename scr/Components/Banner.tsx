import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Colors from '../Helper/Colors';
import {hp, wp} from '../Helper/Responsive';
import {Fonts} from '../Helper/Fonts';
import {checkSubscriptionRequest} from '../redux/slices/subcriptionsSlice';
import Purchases from 'react-native-purchases';

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
    <View style={isSubscriptionActive ? styles.bannerContainer2 : styles.bannerContainer}>
      {/* Left Section: Text and Price OR Loader */}
      <View style={styles.leftSection}>
        {(loading || revenueCatLoading) ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>
              Loading subscription details...
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.priceContainer}>
              <Text style={ isSubscriptionActive ? styles.discountedPrice : styles.discountedPrice2}>

                {isSubscriptionActive
                  ? `Hi, ${userData.first_name} ${userData.last_name}`
                  : 'Start from £50/week'}
              </Text>
              {!isSubscriptionActive && (
                <Text style={styles.originalPrice}>£180/Monthly</Text>
              )}
            </View>
           </>
        )}
      </View>
      {/* Right Section: Button always rendered to maintain width */}
    <TouchableOpacity
        style={styles.getNowButton}
        onPress={() => !isSubscriptionActive && navigation.navigate('Subscriptions')}
        disabled={loading || revenueCatLoading}>
        <Text style={styles.getNowText}>
          {(loading || revenueCatLoading) ? '...' : isSubscriptionActive ? subscriptionName : 'Get Now'}
        </Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: wp(3),
    borderWidth: 0.3,
    paddingHorizontal: 17,
    paddingVertical:10,
    borderColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowRadius: wp(1),
    shadowOffset: {width: 0, height: hp(0.5)},
    elevation: 3,
    width: '100%',
  },
  bannerContainer2: {
    flexDirection: 'row',
    borderRadius: wp(3),
    borderWidth: 0.3,
    paddingHorizontal: 17,
    borderColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  loadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  leftSection: {
    flex: 1,
    marginRight: wp(2),
  },
  priceContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    marginBottom: hp(0.5),
  },
  discountedPrice: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.black,
    marginRight: wp(2),
  },
  discountedPrice2: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.black,
    marginRight: wp(2),
    fontWeight: 'bold',
  },
  additionalText: {
    fontFamily: Fonts.regular,
    fontSize: wp(3),
    color: Colors.black,
    opacity: 0.8,
  },
  getNowButton: {
    borderRadius: wp(2),
    borderColor: 'lightgray',
    borderWidth: 0.3,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
  },
  getNowText: {
    fontSize: wp(3.5),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    textAlign: 'center',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: hp(10),
    padding: wp(4),
  },
  loadingText: {
    color: Colors.primary,
    fontSize: wp(3.5),
    marginLeft: hp(1),
    fontFamily: Fonts.regular,
  },
});

export default Banner;
