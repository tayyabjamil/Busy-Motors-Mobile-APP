
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Modal,
  Platform,
  TouchableWithoutFeedback,
  Alert,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../Helper/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { hp, wp } from '../../Helper/Responsive';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Banner from '../../Components/Banner';
import { Fonts } from '../../Helper/Fonts';
import { toggleFavoriteRequest } from '../../redux/slices/favouriteSlice';
import { RequestLocationPermission } from '../../Helper/Permisions';
import Geolocation from 'react-native-geolocation-service';
import Toast from 'react-native-simple-toast';
import { getDistance } from 'geolib';
import { updateViewCountRequest } from '../../redux/slices/viewCount';
import api from '../../redux/api';
import Slider from '@react-native-community/slider';
import { fetchUserRequest } from '../../redux/slices/userDetail';
import axios, { AxiosError } from 'axios';
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Listings = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const token = useSelector((state: any) => state.auth?.token);
  const {

    userData,
    // error: userError,
  } = useSelector((state: any) => state.user);
  const [error, setError] = useState(null); // Error state
  const [carListings, setCarListings] = useState([]); // Data state
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [refreshing, setRefreshing] = useState(false);
  const { favoriteItems } = useSelector((state: any) => state?.favourite);
  const { hasSubscription, subscriptions } = useSelector(
    (state: any) => state?.subscription?.subscriptionData || {},
  );
  const [activeFilters, setActiveFilters] = useState(['Scrap', 'Salvage']);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [distance, setDistance] = useState<number | null>(90); // Default 90 miles on first open
  const [sliderValue, setSliderValue] = useState<number>(90); // Live display value while dragging
  const activeSubscriptions = useSelector(
    (state: any) => state?.subscription?.activeSubscriptions || [],
  );
  const hasRevenueCatSubscription = activeSubscriptions?.length > 0;
  const [activeDistanceFilter, setActiveDistanceFilter] = useState<boolean | null>(null);

  // RevenueCat products for subscription details
  const [revenueCatProducts, setRevenueCatProducts] = useState<any[]>([]);

  // Fetch RevenueCat products to get subscription type
  useEffect(() => {
    const fetchRevenueCatProducts = async () => {
      try {
        const allOfferings = await Purchases.getOfferings();
        if (allOfferings.current) {
          const packages = allOfferings.current.availablePackages;
          setRevenueCatProducts(packages);
        }
      } catch (error) {
        console.log('Error fetching RevenueCat products:', error);
      }
    };
    fetchRevenueCatProducts();
  }, []);

  console.log('🔑 [Subscriptions] activeSubscriptions:', activeSubscriptions);
  console.log('🔑 [Subscriptions] count:', activeSubscriptions?.length);
  console.log('🔑 [Subscriptions] revenueCatProducts:', revenueCatProducts.map((p: any) => p.product.identifier));

  // Get ALL active subscription types (handles multiple subscriptions)
  const getActiveSubscriptionTypes = () => {
    let hasScrap = false;
    let hasSalvage = false;

    if (activeSubscriptions.length === 0) {
      return { hasScrap, hasSalvage, hasBoth: false, hasAny: false };
    }

    // Check ALL active subscriptions directly from identifiers
    activeSubscriptions.forEach((subscriptionId: string) => {
      const identifier = subscriptionId.toLowerCase();
      console.log('🔍 [Subscriptions] checking identifier:', identifier);
      if (identifier.includes('scrap')) {
        hasScrap = true;
      }
      if (identifier.includes('salvage')) {
        hasSalvage = true;
      }
    });

    return {
      hasScrap,
      hasSalvage,
      hasBoth: hasScrap && hasSalvage,
      hasAny: hasScrap || hasSalvage,
    };
  };

  const subscriptionTypes = getActiveSubscriptionTypes();

  // For backward compatibility - get primary subscription type
  const activeSubscriptionType = subscriptionTypes.hasBoth
    ? 'both'
    : subscriptionTypes.hasScrap
      ? 'scrap'
      : subscriptionTypes.hasSalvage
        ? 'salvage'
        : null;

  // Set default filter based on subscription types when they change
  useEffect(() => {
    if (subscriptionTypes.hasAny) {
      let defaultFilter: string[] = [];

      if (subscriptionTypes.hasBoth) {
        // User has both subscriptions - show both types
        defaultFilter = ['Scrap', 'Salvage'];
      } else if (subscriptionTypes.hasScrap) {
        defaultFilter = ['Scrap'];
      } else if (subscriptionTypes.hasSalvage) {
        defaultFilter = ['Salvage'];
      }

      setActiveFilters(defaultFilter);
    }
  }, [subscriptionTypes.hasScrap, subscriptionTypes.hasSalvage]);

  // Check if user is trying to view cars outside their subscription
  const locationOptions = [
    '5 miles',
    '10 miles',
    '20 miles',
    '25 miles',
    '50 miles',
  ];

  // Helper function to convert to camel case (first letter uppercase, rest lowercase)
  const toCamelCase = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Get unique fuel types and colors from car listings (case-insensitive, displayed in camel case)
  const fuelTypeMap = new Map<string, string>();
  carListings?.forEach((item: any) => {
    if (item?.fuelType) {
      const lowerKey = item.fuelType.toLowerCase();
      if (!fuelTypeMap.has(lowerKey)) {
        fuelTypeMap.set(lowerKey, toCamelCase(item.fuelType));
      }
    }
  });
  const uniqueFuelTypes = Array.from(fuelTypeMap.values()).sort() as string[];

  const colorMap = new Map<string, string>();
  carListings?.forEach((item: any) => {
    if (item?.color) {
      const lowerKey = item.color.toLowerCase();
      if (!colorMap.has(lowerKey)) {
        colorMap.set(lowerKey, toCamelCase(item.color));
      }
    }
  });
  const uniqueColors = Array.from(colorMap.values()).sort() as string[];

  // All available brands with their display names and image mappings
  const allAvailableBrands = [
    { name: 'Aston Martin', key: 'astonmartin' },
    { name: 'BAIC', key: 'baic' },
    { name: 'Bugatti', key: 'bugatti' },
    { name: 'Chevrolet', key: 'chevrolet' },
    { name: 'Citroen', key: 'citroen' },
    { name: 'Dacia', key: 'dacia' },
    { name: 'Daihatsu', key: 'daihatsu' },
    { name: 'Dodge', key: 'dodge' },
    { name: 'Dongfeng', key: 'dongfeng' },
    { name: 'Ford', key: 'ford' },
    { name: 'Honda', key: 'honda' },
    { name: 'Hyundai', key: 'hyundai' },
    { name: 'Kia', key: 'kia' },
    { name: 'Lamborghini', key: 'lamborghini' },
    { name: 'Lotus', key: 'lotus' },
    { name: 'Mazda', key: 'mazda' },
    { name: 'McLaren', key: 'mclaren' },
    { name: 'Mercedes-Benz', key: 'mercedes-benz' },
    { name: 'MG', key: 'mg' },
    { name: 'Mini', key: 'mini' },
    { name: 'Nissan', key: 'nissan' },
    { name: 'Opel', key: 'opel' },
    { name: 'Proton', key: 'proton' },
    { name: 'Rolls-Royce', key: 'rollsroyce' },
    { name: 'SAIC', key: 'saic' },
    { name: 'Skoda', key: 'skoda' },
    { name: 'Suzuki', key: 'suzuki' },
    { name: 'Tesla', key: 'tesla' },
    { name: 'Vauxhall', key: 'vauxhall' },
    { name: 'Volkswagen', key: 'volkswagen' },
    { name: 'Volvo', key: 'volvo' },
    { name: 'XPeng', key: 'xpeng' },
  ];

  // Get unique brands from car listings to show which ones are available
  const brandMap = new Map<string, string>();
  carListings?.forEach((item: any) => {
    if (item?.make) {
      const lowerKey = item.make.toLowerCase();
      if (!brandMap.has(lowerKey)) {
        brandMap.set(lowerKey, toCamelCase(item.make));
      }
    }
  });

  // Use all available brands for the filter
  const uniqueBrands = allAvailableBrands.map(brand => brand.name).sort() as string[];

  // useEffect(() => {
  //   if (isFocused) {
  //     dispatch(getUserRequest(token));
  //   }
  // }, [isFocused]);

  // Fetch carListings when the screen is focused
  console.log('🏠 [CarListings] Component rendered');
  console.log('🏠 [CarListings] Token from Redux:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    token: token ? `${token.substring(0, 20)}...` : 'null'
  });

  useEffect(() => {
    console.log('🏠 [CarListings] useEffect triggered, isFocused:', isFocused);
    if (isFocused && token) {
      fetchCarListings();
      dispatch(fetchUserRequest(token));
    }
  }, [isFocused, token]);

  useEffect(() => {
    getLocation();
    AsyncStorage.getItem('filter_radius').then(saved => {
      if (saved !== null) {
        const parsed = Number(saved);
        setDistance(parsed);
        setSliderValue(parsed);
      }
    });
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await api.get('/car/get-all-listing', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setCarListings(response.data);
    } catch (err: any) {
      console.log('Refresh error:', err?.message);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCarListings = async () => {
    console.log('🏠 [CarListings] fetchCarListings called');
    console.log('🏠 [CarListings] Token check:', {
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 20)}...` : 'null'
    });

    setError(null);
    setIsLoading(true);

    try {
      if (!token) {
        console.error('❌ [CarListings] TOKEN NOT FOUND!');
        console.error('❌ [CarListings] This is the error the user is seeing');
        throw new Error('Token not found');
      }

      console.log('✅ [CarListings] Token exists, making API call...');

      const response = await api.get('/car/get-all-listing', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('@response', response.data);
      console.log('@first item tag:', response.data?.[0]?.tag, '| keys:', Object.keys(response.data?.[0] || {}));
      setCarListings(response.data);
    } catch (err) {
      if (err.response) {
        // Server response with error status (4xx, 5xx)
        console.log('API Error Response:', err.response.data);
        console.log('Status Code:', err.response.status);
        console.log('Headers:', err.response.headers);
        setError(err.response.data?.message || 'Something went wrong!');
      } else if (err.request) {
        // No response from server (Network error)
        console.log('API Request Error:', err.request);
        setError(
          'No response from server. Please check your internet connection.',
        );
      } else {
        // Other errors
        console.log('API Unexpected Error:', err.message);
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getLocation = async () => {
    const hasLocationPermission = await RequestLocationPermission();
    if (hasLocationPermission === 'granted') {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          // Auto-enable distance filter with the default/current distance on first load
          setActiveDistanceFilter(true);
        },
        error => {
          console.log('Location error:', error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    }
  };
  const handleFilterPress = (filter: any) => {
    if (filter === 'Saved') {
      navigation.navigate('Savage');
    } else {
      setActiveFilters(prevFilters =>
        prevFilters.includes(filter)
          ? prevFilters.filter(f => f !== filter)
          : [...prevFilters, filter],
      );
    }
  };

  const handleLocationSelect = (location: any) => {
    const numericDistance = parseFloat(location);
    saveAgentLocation(numericDistance);
    setSelectedLocation(location);
    setIsLocationModalVisible(false);
  };
  const saveAgentLocation = async (distanceFilter: number | null) => {
    const body = {
      latitude: currentLocation?.latitude || '0.0',
      longitude: currentLocation?.longitude || '0.0',
      distance_filter: distanceFilter,
    };

    try {
      const response = await api.put('/auth/save-agent-location', body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.status === 200) {
        Toast.show('Location updated successfully', Toast.LONG);
        return response.data;
      }
    } catch (error) {
      const err = error as AxiosError<any>;
      console.log(
        'Update User Profile Error:',
        err.response?.data || err.message,
      );
      throw new Error(
        err.response?.data?.message || 'Failed to update user profile',
      );
    }
  };

  const resetFilter = () => {
    setSelectedLocation(null); // Reset the selected location filter
    setIsLocationModalVisible(false);
    saveAgentLocation(null); // 👈 send null when "None" is pressed
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 'N/A';

    // Calculate distance in meters using geolib
    const distanceInMeters = getDistance(
      { latitude: lat1, longitude: lon1 },
      { latitude: lat2, longitude: lon2 },
    );

    // Convert meters to miles (1 meter = 0.000621371 miles)
    const distanceInMiles = (distanceInMeters * 0.000621371).toFixed(1); // Convert to miles and round to 1 decimal place

    return `${distanceInMiles} mi`; // Return distance in miles
  };
  const filteredData = carListings?.filter(item => {
    // 1. Filter by active tags (user can always change filters)
    const filterMatch =
      (activeFilters.includes('Scrap') && item.tag === 'scrap') ||
      (activeFilters.includes('Salvage') && item.tag === 'salvage') ||
      activeFilters.length === 0;

    // 2. Apply distance filter ONLY if user actively filtered AND we have valid location AND distance < 100 (100 = everywhere)
    let distanceMatch = true;
    if (
      activeDistanceFilter === true &&
      distance !== null &&
      distance < 100 &&
      currentLocation?.latitude !== null &&
      currentLocation?.longitude !== null &&
      item?.latitude &&
      item?.longitude
    ) {
      const distanceInMeters = getDistance(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        { latitude: item.latitude, longitude: item.longitude },
      );
      const distanceInMiles = distanceInMeters * 0.000621371;
      distanceMatch = distanceInMiles <= distance;
    }

    return filterMatch && distanceMatch;
  });
  const noDataFound = filteredData?.length === 0;
  const sortedData = filteredData?.sort((a, b) => {
    const dateA = new Date(a.date_added);
    const dateB = new Date(b.date_added);
    return dateB - dateA;
  });

  const handleToggleFavorite = (item: any, isFavorite: boolean) => {
    if (userData?.is_guest) {
      Toast.show(
        'Subscribe to favorite cars and unlock all features.',
        Toast.LONG,
      );

      return;
    }

    dispatch(toggleFavoriteRequest({ carId: item?._id, token }));

    if (isFavorite) {
      Toast.show(`${item.make} removed from Favorites`);
    } else {
      Toast.show(`${item.make} added to Favorites`);
    }
  };

  const handleCarDetailsNavigation = (car: any) => {
    dispatch(updateViewCountRequest({ carId: car._id, token }));
    navigation.navigate('CarDeatils', { car });
  };

  // Function to get brand image icon
  const getBrandImage = (brandName: string) => {
    if (!brandName) return null;

    // Find the brand in allAvailableBrands
    const brand = allAvailableBrands.find(
      b => b.name.toLowerCase() === brandName.toLowerCase()
    );

    if (!brand) return null;

    // Map brand keys to image files
    const brandImageMap: { [key: string]: any } = {
      'astonmartin': require('../../assets/cars/astonmartin.png'),
      'baic': require('../../assets/cars/baic.png'),
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
      'mercedes-benz': require('../../assets/cars/mercedes-benz.png'),
      'mg': require('../../assets/cars/mg.png'),
      'mini': require('../../assets/cars/mini.png'),
      'nissan': require('../../assets/cars/nissan.png'),
      'opel': require('../../assets/cars/opel.png'),
      'proton': require('../../assets/cars/proton.png'),
      'rollsroyce': require('../../assets/cars/rollsroyce.png'),
      'saic': require('../../assets/cars/saic.png'),
      'skoda': require('../../assets/cars/skoda.png'),
      'suzuki': require('../../assets/cars/suzuki.png'),
      'tesla': require('../../assets/cars/tesla.png'),
      'vauxhall': require('../../assets/cars/vauxhall.png'),
      'volkswagen': require('../../assets/cars/volkswagen.png'),
      'volvo': require('../../assets/cars/volvo.png'),
      'xpeng': require('../../assets/cars/xpeng.png'),
    };

    return brandImageMap[brand.key] || null;
  };

  // Default car image fallback
  const defaultCarImage = require('../../assets/car2.png');

  // Function to get car brand logo - always shows brand logo
  const getCarImage = (make: string) => {
    // Normalize make name to match image filename format
    const normalizedMake = make?.toLowerCase().trim();

    // Map of make names to brand logo images
    const makeToImageMap: { [key: string]: any } = {
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

    // Return brand logo if found, otherwise default car image
    return normalizedMake && makeToImageMap[normalizedMake]
      ? makeToImageMap[normalizedMake]
      : defaultCarImage;
  };

  const renderItem = ({ item, index }) => {
    const isFavorite = favoriteItems?.includes(item._id);
    const getTimeAgo = dateString => {
      const dateAdded = new Date(dateString);
      const now = new Date();
      const diffInMs = now - dateAdded;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      return `${diffInDays} days ago`;
    };

    const timeAgo = getTimeAgo(item.date_added);
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      item.latitude,
      item.longitude,
    );

    let isSubscriptionActive = hasRevenueCatSubscription || subscriptions;

    const motDueRaw = item.motDue || item.mot_due || item.motExpiry;
    const motDueDate = motDueRaw
      ? new Date(motDueRaw).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).toUpperCase()
      : null;

    return (
      <View style={styles.listingCardContainer}>
        <Pressable
          onPress={() => {
            // Check if car has more than 20 views and user doesn't have subscription
            if (item?.views?.length > 20 && !isSubscriptionActive) {
              Alert.alert(
                'High Demand Car',
                'This car has been visited by too many users. Subscribe to our subscription to view details and unlock all features.',
                [
                  {
                    text: 'Subscribe Now',
                    onPress: () => navigation.navigate('Subscriptions'),
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                ]
              );
              return;
            }

            // Original logic for sold cars
            if (item.isSold) {
              Alert.alert('Car Sold', 'This car has already been sold.', [
                {
                  text: 'OK',
                  onPress: () => handleCarDetailsNavigation(item),
                },
              ]);
            } else {
              handleCarDetailsNavigation(item);
            }
          }}
          style={styles.listingCard}
        >
          {/* Top Row: Heart | Tag | Brand Logo */}
          <View style={styles.cardTopRow}>
            {!item.isSold ? (
              <TouchableOpacity onPress={() => handleToggleFavorite(item, isFavorite)}>
                <Image
                  source={isFavorite ? require('../../assets/heart.png') : require('../../assets/simpleHeart.png')}
                  style={styles.heartIcon}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.heartIconPlaceholder} />
            )}

            {item.isSold
              ? <Text style={styles.soldText}>SOLD</Text>
              : <View style={styles.cardTypeTag}>
                <Text style={styles.cardTypeText}>{(item.tag || 'Unknown').charAt(0).toUpperCase() + (item.tag || 'Unknown').slice(1)}</Text>
              </View>
            }

            <Image
              source={getCarImage(item?.make)}
              resizeMode="contain"
              style={styles.brandLogo}
            />
          </View>

          {/* Title + Tag Row */}
          <View style={[styles.titleTagRow, item.isSold && { opacity: 0.5 }]}>
            <Text style={styles.carTitle} numberOfLines={1}>
              {item.make?.toUpperCase()} {item.model?.toUpperCase()} ({item.yearOfManufacture})
            </Text>
          </View>

          {/* Info Grid */}
          <View style={[item.isSold && { opacity: 0.5 }]}>
            <View style={styles.infoBox}>
              <View style={styles.infoColumn}>
                <MaterialCommunityIcons name="card-text-outline" size={wp(5)} color={Colors.primary} style={styles.infoIcon} />
                <Text style={styles.label}>REG</Text>
                <Text style={styles.value}>{item.registrationNumber || 'N/A'}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoColumn}>
                <MaterialIcons name="warning" size={wp(5)} color="#F59E0B" style={styles.infoIcon} />
                <Text style={styles.label}>PROBLEMS</Text>
                <Text style={styles.value} numberOfLines={1}>{item.problem?.toUpperCase() || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoColumn}>
                <MaterialCommunityIcons name="car" size={wp(5)} color={Colors.primary} style={styles.infoIcon} />
                <Text style={styles.label}>MAKE</Text>
                <Text style={styles.value}>{item.make || 'N/A'}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoColumn}>
                <MaterialCommunityIcons name="car-side" size={wp(5)} color={Colors.primary} style={styles.infoIcon} />
                <Text style={styles.label}>MODEL</Text>
                <Text style={styles.value}>{item.model || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoColumn}>
                <MaterialCommunityIcons name="cog" size={wp(5)} color={Colors.primary} style={styles.infoIcon} />
                <Text style={styles.label}>TRANSMISSION</Text>
                <Text style={styles.value}>{(item.transmissionType || item.transmission || 'N/A').toUpperCase()}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoColumn}>
                <MaterialIcons name="location-on" size={wp(5)} color={Colors.primary} style={styles.infoIcon} />
                <Text style={styles.label}>POSTCODE</Text>
                <Text style={styles.value}>{item.postcode ? item.postcode.toString().toUpperCase().slice(0, 3) : 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoColumn}>
                <MaterialCommunityIcons name="palette" size={wp(5)} color={Colors.primary} style={styles.infoIcon} />
                <Text style={styles.label}>COLOUR</Text>
                <Text style={styles.value}>{item.color || 'N/A'}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoColumn}>
                <MaterialCommunityIcons name="gas-station" size={wp(5)} color={Colors.primary} style={styles.infoIcon} />
                <Text style={styles.label}>FUEL TYPE</Text>
                <Text style={styles.value}>{item.fuelType || 'N/A'}</Text>
              </View>
            </View>

            {/* MOT DUE Row */}
            {motDueDate && (
              <View style={styles.motDueRow}>
                <Image source={require('../../assets/timer.png')} style={styles.motIcon} />
                <View>
                  <Text style={styles.motLabel}>MOT DUE</Text>
                  <Text style={styles.motDate}>{motDueDate}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Image source={require('../../assets/pin.png')} style={[styles.footerItemIcon, item.isSold && { opacity: 0.5 }]} />
              <Text style={[styles.footerText, item.isSold && { opacity: 0.5 }]}>{distance}</Text>
            </View>
            <View style={styles.footerItem}>
              <Image source={require('../../assets/timer.png')} style={[styles.footerItemIcon, item.isSold && { opacity: 0.5 }]} />
              <Text style={[styles.footerText, item.isSold && { opacity: 0.5 }]}>{timeAgo}</Text>
            </View>
            <View style={styles.footerItem}>
              <Image source={require('../../assets/eye.png')} style={[styles.footerItemIcon, item.isSold && { opacity: 0.5 }]} />
              <Text style={[styles.footerText, item.isSold && { opacity: 0.5 }]}>{item?.views?.length}</Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }
  const handleSliderComplete = (value: any) => {
    setSliderValue(value);
    setDistance(value);
    if (value >= 100) {
      setActiveDistanceFilter(null);
    } else if (currentLocation?.latitude !== null && currentLocation?.longitude !== null) {
      setActiveDistanceFilter(true);
    }
  };

  const kilometersToMiles = km => {
    return km * 0.621371;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        transparent={true}
        visible={isLocationModalVisible}
        onRequestClose={() => setIsLocationModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsLocationModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.distanceByFilter}>Distance by filter</Text>
            {locationOptions.map((location, index) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.locationOption,
                  index === locationOptions.length - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}
                onPress={() => handleLocationSelect(location)}>
                <Text style={styles.locationText}>{location}</Text>
                {selectedLocation === location && (
                  <Image
                    source={require('../../assets/tic.png')}
                    style={styles.tickIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
            {/* Reset Filter Button */}
            <TouchableOpacity style={styles.resetButton} onPress={resetFilter}>
              <Text style={styles.resetButtonText}>Reset Filter</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>


      <FlatList
        data={isLoading ? [] : (noDataFound ? [] : sortedData)}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            <Banner navigation={navigation} />
            <View style={styles.inlineFilterContainer}>
              {/* Distance Section */}
              <View style={styles.filterDistanceRow}>
                <Text style={styles.filterSectionLabel}>Search by distance</Text>
                <View style={styles.filterDistanceBadge}>
                  <Text style={styles.filterDistanceBadgeText}>
                    {sliderValue >= 100 ? 'Everywhere' : `${sliderValue} mi`}
                  </Text>
                </View>
              </View>
              <Slider
                style={styles.filterSlider}
                minimumValue={0}
                maximumValue={100}
                step={5}
                value={sliderValue}
                onValueChange={(value) => setSliderValue(value)}
                onSlidingComplete={handleSliderComplete}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor={Colors.primary}
              />

              {/* Divider */}
              <View style={styles.filterDivider} />

              {/* Type Section */}
              <View style={styles.filterTypeRow}>
                <Text style={styles.filterSectionLabel}>Car Category</Text>
                <View style={styles.filterOptionsRow}>
                  {['Scrap', 'Salvage'].map(filter => {
                    const isActive = activeFilters.includes(filter);
                    return (
                      <TouchableOpacity
                        key={filter}
                        style={[
                          styles.filterOptionButton,
                          isActive && styles.filterOptionButtonActive,
                        ]}
                        onPress={() => {
                          const newFilters = isActive
                            ? activeFilters.filter(f => f !== filter)
                            : [...activeFilters, filter];
                          setActiveFilters(newFilters);
                        }}>
                        <Text
                          style={[
                            styles.filterOptionText,
                            isActive && styles.filterOptionTextActive,
                          ]}>
                          {filter}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loaderText}>Loading cars...</Text>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIconContainer}>
                <Image
                  source={require('../../assets/search.png')}
                  style={styles.emptyStateIcon}
                />
              </View>
              <Text style={styles.emptyStateTitle}>No Cars Found</Text>
              <Text style={styles.emptyStateDescription}>
                We couldn't find any cars matching your current filters. Try adjusting your search criteria or check back later for new listings.
              </Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item?._id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inlineFilterContainer: {
    marginTop: hp(0.5),
    marginHorizontal: wp(1),
    backgroundColor: Colors.white,
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  filterDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(0.5),
  },
  filterSectionLabel: {
    fontSize: wp(3.5),
    fontFamily: Fonts.semiBold,
    color: '#666',
    letterSpacing: 0.3,
  },
  filterDistanceBadge: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.4),
    borderRadius: wp(5),
  },
  filterDistanceBadgeText: {
    fontSize: wp(3.2),
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  filterDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: hp(1.2),
  },
  filterTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: wp(4),
    color: Colors.textGray,
  },
  icon: {
    width: wp(4),
    resizeMode: 'contain',
    height: wp(4),
    tintColor: Colors.black,
  },
  header: {
    marginVertical: wp(2),
  },
  locationIcon: {
    width: wp(7),
    height: wp(7),
    tintColor: Colors.footerGray,
    resizeMode: 'contain',
  },

  filterContainer: {
    flexDirection: 'row',
    marginVertical: hp(1.5),
  },
  resetButton: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 5,
    marginTop: 10,
  },
  resetButtonText: {
    color: Colors.white,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(20),
  },
  noDataText: {
    fontSize: wp(4),
    color: Colors.red,
    fontFamily: Fonts.regular,
  },
  // Loader Styles
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(15),
  },
  loaderText: {
    marginTop: hp(2),
    fontSize: wp(4),
    fontFamily: Fonts.medium,
    color: Colors.gray,
  },
  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(10),
    paddingVertical: hp(8),
    marginTop: hp(5),
  },
  emptyStateIconContainer: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2.5),
  },
  emptyStateIcon: {
    width: wp(10),
    height: wp(10),
    tintColor: '#9E9E9E',
  },
  emptyStateTitle: {
    fontSize: wp(6),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: wp(3.8),
    fontFamily: Fonts.regular,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: hp(2.8),
    marginBottom: hp(3),
    paddingHorizontal: wp(5),
  },
  filterBarContainer: {
    flexDirection: 'row',
    paddingVertical: hp(1),
    gap: wp(2),
  },
  filterChip: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(0.8),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: wp(3.5),
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  //render item
  listingCardContainer: {
    marginBottom: 0,
    position: 'relative',
  },
  listingCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 0.2,
    marginTop: 10,
    padding: wp(4),
    paddingVertical: hp(2.5),
    minHeight: hp(22),
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: wp(2),
    shadowOffset: { width: 0, height: hp(0.5) },
    elevation: 3,
    borderColor: '#E8E8E8',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  heartIcon: {
    width: wp(6),
    height: wp(6),
  },
  heartIconPlaceholder: {
    width: wp(6),
    height: wp(6),
  },
  regNumber: {
    fontSize: wp(5.5),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.darkGray,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: wp(2),
  },
  brandLogo: {
    width: 50,
    height: 50,
  },
  titleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1.5),
  },
  carTitle: {
    fontSize: wp(3.8),
    fontFamily: Fonts.bold,
    fontWeight: '600',
    color: Colors.primary,
    flex: 1,
    marginRight: wp(2),
  },
  scrapTag: {
    backgroundColor: '#1e1e1b10',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  scrapText: {
    color: 'black',
    fontSize: 13,
    fontWeight: '500',
  },
  cardTypeTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.4),
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#DCDCDC',
  },
  cardTypeText: {
    color: Colors.darkGray,
    fontSize: wp(4),
    fontFamily: Fonts.semiBold,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    padding: wp(3),
    borderRadius: wp(3),
    marginBottom: hp(1),
    alignItems: 'center',
  },
  infoColumn: { flex: 1, paddingHorizontal: wp(1) },
  infoIcon: {
    marginBottom: 4,
  },
  label: {
    fontSize: wp(2.8),
    color: Colors.gray,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  value: {
    fontSize: wp(3.5),
    color: Colors.darkGray,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    marginTop: 2,
  },
  separator: {
    width: 1,
    backgroundColor: '#D1D1D1',
    marginHorizontal: wp(2),
    height: '100%',
  },
  motDueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE8E8',
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(1),
    gap: wp(3),
  },
  motIcon: {
    width: wp(5),
    height: wp(5),
    resizeMode: 'contain',
    tintColor: Colors.red,
  },
  motLabel: {
    fontSize: wp(2.8),
    color: Colors.red,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  motDate: {
    fontSize: wp(3.5),
    color: Colors.red,
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
    paddingTop: hp(1),
    borderTopWidth: 0.5,
    borderTopColor: Colors.lightGray,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  footerItemIcon: {
    width: wp(4),
    height: wp(4),
    resizeMode: 'contain',
    tintColor: Colors.darkGray,
  },
  footerText: {
    fontFamily: Fonts.medium,
    fontSize: wp(3),
    color: Colors.darkGray,
  },
  //Slider
  sliderContainer: {
    width: wp(82),
    marginBottom: hp(1),
  },
  slider: {
    width: '100%',
    height: 15,
  },
  //Modal
  modalOverlay: {
    marginRight: hp(7),
    marginTop: hp(15),
    alignSelf: 'flex-end',
  },
  distanceByFilter: {
    textAlign: 'center',
    borderBottomWidth: 0.3,
    borderColor: Colors.darkGray,
    color: Colors.primary,
    width: '90%',
    fontFamily: Fonts.semiBold,
    marginHorizontal: 10,
    alignSelf: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 10,
    width: '50%',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    fontFamily: Fonts.medium,
  },
  tickIcon: {
    width: wp(5),
    height: wp(5),
    tintColor: Colors.primary,
  },

  soldText: {
    color: '#FF3B30',
    fontSize: wp(5.5),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  // Filter Modal Styles
  filterSection: {
    marginTop: hp(1.5),
    marginBottom: hp(1.5),
  },
  filterSectionTitle: {
    fontSize: wp(5),
    fontFamily: Fonts.semiBold,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: hp(1.5),
  },
  filterOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  filterOptionButton: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.7),
    borderRadius: wp(5),
    backgroundColor: '#F2F2F2',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  brandFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  brandIcon: {
    width: wp(6),
    height: wp(6),
  },
  filterOptionButtonActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: wp(3.2),
    fontFamily: Fonts.medium,
    color: '#888',
  },
  filterOptionTextActive: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
  filterOptionButtonDisabled: {
    opacity: 0.3,
  },
  filterOptionTextDisabled: {
    color: Colors.textSecondary,
  },
  filterSlider: {
    width: '100%',
    height: 20,
    marginHorizontal: -wp(1),
  },
  // Restricted Content Styles
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(8),
    paddingVertical: hp(8),
    marginTop: hp(5),
  },
  restrictedIconContainer: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(3),
  },
  lockEmoji: {
    fontSize: wp(12),
  },
  restrictedTitle: {
    fontSize: wp(6),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  restrictedSubtitle: {
    fontSize: wp(4),
    fontFamily: Fonts.medium,
    color: Colors.darkGray,
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  restrictedHighlight: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
  restrictedDescription: {
    fontSize: wp(3.8),
    fontFamily: Fonts.regular,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: hp(2.8),
    marginBottom: hp(3),
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(10),
    borderRadius: wp(3),
    marginBottom: hp(1.5),
  },
  upgradeButtonText: {
    fontSize: wp(4.2),
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  backToMyListingsButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
  },
  backToMyListingsText: {
    fontSize: wp(3.8),
    fontFamily: Fonts.medium,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});

export default Listings;
