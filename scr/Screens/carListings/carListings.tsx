import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Colors from '../../Helper/Colors';
import {useDispatch, useSelector} from 'react-redux';
import {hp, wp} from '../../Helper/Responsive';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Banner from '../../Components/Banner';
import {Fonts} from '../../Helper/Fonts';
import {toggleFavoriteRequest} from '../../redux/slices/favouriteSlice';
import {RequestLocationPermission} from '../../Helper/Permisions';
import Geolocation from 'react-native-geolocation-service';
import Toast from 'react-native-simple-toast';
import {getDistance} from 'geolib';
import {updateViewCountRequest} from '../../redux/slices/viewCount';
import api from '../../redux/api';
import Slider from '@react-native-community/slider';
import {fetchUserRequest} from '../../redux/slices/userDetail';
import axios, {AxiosError} from 'axios';

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
  const {favoriteItems} = useSelector((state: any) => state?.favourite);
  const {hasSubscription,subscriptions} = useSelector(
    (state: any) => state?.subscription?.subscriptionData || {},
  );
  const [activeFilters, setActiveFilters] = useState(['Scrap', 'Salvage']);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [distance, setDistance] = useState(null); // Start with null (no filtering)
  const activeSubscriptions = useSelector(
    (state: any) => state?.subscription?.activeSubscriptions || [],
  );
  const hasRevenueCatSubscription = activeSubscriptions?.length > 0;
  const [activeDistanceFilter, setActiveDistanceFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  
  // Temporary filter states (used in modal before applying)
  const [tempActiveFilters, setTempActiveFilters] = useState(['Scrap', 'Salvage']);
  const [tempDistance, setTempDistance] = useState<number | null>(null);
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
  }, []);
  const fetchCarListings = async () => {
    console.log('🏠 [CarListings] fetchCarListings called');
    console.log('🏠 [CarListings] Token check:', {
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 20)}...` : 'null'
    });

    setError(null);

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
    }
  };

  const getLocation = async () => {
    const hasLocationPermission = await RequestLocationPermission();
    if (hasLocationPermission === 'granted') {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setCurrentLocation({latitude, longitude});
        },
        error => {
          console.log('Location error:', error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
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
      {latitude: lat1, longitude: lon1},
      {latitude: lat2, longitude: lon2},
    );

    // Convert meters to miles (1 meter = 0.000621371 miles)
    const distanceInMiles = (distanceInMeters * 0.000621371).toFixed(1); // Convert to miles and round to 1 decimal place

    return `${distanceInMiles} mi`; // Return distance in miles
  };
  const filteredData = carListings?.filter(item => {
    // 1. Filter by active tags
    const filterMatch =
      (activeFilters.includes('Scrap') && item.tag === 'scrap') ||
      (activeFilters.includes('Salvage') && item.tag === 'salvage') ||
      activeFilters.length === 0;

    // 2. Apply distance filter ONLY if user actively filtered AND we have valid location
    let distanceMatch = true;
    if (
      activeDistanceFilter === true &&
      distance !== null &&
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
        {latitude: item.latitude, longitude: item.longitude},
      );
      const distanceInKm = distanceInMeters / 1000;
      distanceMatch = distanceInKm <= distance;
    }

    // 3. Apply search filter (real-time local search)
    let searchMatch = true;
    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      const searchableFields = [
        item?.make || '',
        item?.model || '',
        item?.registrationNumber || '',
        item?.color || '',
        item?.fuelType || '',
        item?.yearOfManufacture?.toString() || '',
        item?.postcode || '',
      ];
      
      // Check if any field contains the search query
      searchMatch = searchableFields.some(field => 
        field.toLowerCase().includes(query)
      );
    }

    return filterMatch && distanceMatch && searchMatch;
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

    dispatch(toggleFavoriteRequest({carId: item?._id, token}));

    if (isFavorite) {
      Toast.show(`${item.make} removed from Favorites`);
    } else {
      Toast.show(`${item.make} added to Favorites`);
    }
  };

  const handleCarDetailsNavigation = (car: any) => {
    dispatch(updateViewCountRequest({carId: car._id, token}));
    navigation.navigate('CarDeatils', {car});
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
    const brandImageMap: {[key: string]: any} = {
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

    // Return brand logo if found, otherwise default car image
    return normalizedMake && makeToImageMap[normalizedMake] 
      ? makeToImageMap[normalizedMake] 
      : defaultCarImage;
  };

  const renderItem = ({item, index}) => {
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
        {!item.isSold && (
          <TouchableOpacity style={styles.heartTagContainer} onPress={() => handleToggleFavorite(item, isFavorite)}>
            <Image
              source={isFavorite ? require('../../assets/heart.png') : require('../../assets/simpleHeart.png')}
              style={styles.heartIcon}
            />
          </TouchableOpacity>
        )}
      {/* SOLD overlay */}
      {item.isSold && <Text style={styles.soldText}>SOLD</Text>}

      {/* Car Image */}
      {!item.isSold && (
        <View style={styles.carImageContainer}>
          <Image
            source={getCarImage(item?.make)}
            resizeMode="contain"
            style={styles.carImage}
          />
        </View>
      )}

      {/* Car Details */}
      <View style={[styles.detailsContainer, item.isSold && { opacity: 0.5 }]}>
        {/* Car Title */}
               <View
          style={styles.titleContainer}>
        <Text  style={[styles.carTitle, {flexShrink: 1, marginRight: 10}]} numberOfLines={1}>
          {item.make} {item.model} ({item.yearOfManufacture})
        </Text>
         <View
             style={styles.scrapTag}>
             <Text style={styles.scrapText}>
               {item.tag || 'Unknown'}
             </Text>
           </View>
           </View>

        {/* Info Boxes */}
        <View style={styles.infoBox}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Registration:</Text>
            <Text style={styles.value}>{item.registrationNumber || 'N/A'}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Year:</Text>
            <Text style={styles.value}>{item.yearOfManufacture || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Fuel Type:</Text>
            <Text style={styles.value}>{item.fuelType || 'N/A'}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Model:</Text>
            <Text style={styles.value}>{item.model || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Postcode:</Text>
            <Text style={styles.value}>
              {item.postcode?.toString().length > 3
                ? item.postcode.toString().substring(0, 3).toUpperCase() + '...'
                : item.postcode?.toString().toUpperCase() || 'N/A'}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Colour:</Text>
            <Text style={styles.value}>{item.color || 'N/A'}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={{ alignItems: 'center' }}>
            <Image source={require('../../assets/pin.png')} style={[styles.icon, item.isSold && { opacity: 0.5 }]} />
            <Text style={[styles.footerText, item.isSold && { opacity: 0.5 }]}>{distance}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Image source={require('../../assets/timer.png')} style={[styles.icon, item.isSold && { opacity: 0.5 }]} />
            <Text style={[styles.footerText, item.isSold && { opacity: 0.5 }]}>{timeAgo}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Image source={require('../../assets/eye.png')} style={[styles.icon, item.isSold && { opacity: 0.5 }]} />
            <Text style={[styles.footerText, item.isSold && { opacity: 0.5 }]}>{item?.views?.length}</Text>
          </View>
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
  const handleSliderChange = value => {
    setTempDistance(value);
  };

  const handleSliderComplete = (value: any) => {
    setTempDistance(value);
  };

  // Open filter modal and initialize temp states with current applied values
  const openFilterModal = () => {
    setTempActiveFilters([...activeFilters]);
    setTempDistance(distance);
    setIsFilterModalVisible(true);
  };

  // Apply filters when user clicks Filter button
  const applyFilters = () => {
    setActiveFilters([...tempActiveFilters]);
    setDistance(tempDistance);
    
    // Enable distance filter only if user set a distance and has location
    if (tempDistance !== null && currentLocation?.latitude !== null && currentLocation?.longitude !== null) {
      setActiveDistanceFilter(true);
    } else {
      setActiveDistanceFilter(null);
    }
    setIsFilterModalVisible(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setTempActiveFilters(['Scrap', 'Salvage']);
    setTempDistance(null);
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
              <Text style={styles.resetButtonText}>Reset Filtertr</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter Bottom Sheet Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFilterModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setIsFilterModalVisible(false)}>
          <View style={styles.filterModalOverlay}>
            <View 
              style={styles.filterModalContent}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => false}>
                {/* Header */}
                <View style={styles.filterModalHeader}>
                  <Text style={styles.filterModalTitle}>Filters</Text>
                  <TouchableOpacity onPress={resetFilters}>
                    <Text style={styles.resetButtonText}>RESET</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.filterScrollView}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  bounces={false}>
              {/* Scrap/Salvage Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Type</Text>
                <View style={styles.filterOptionsRow}>
                  {['Scrap', 'Salvage'].map(filter => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterOptionButton,
                        tempActiveFilters.includes(filter) &&
                          styles.filterOptionButtonActive,
                      ]}
                      onPress={() => {
                        setTempActiveFilters(prev =>
                          prev.includes(filter)
                            ? prev.filter(f => f !== filter)
                            : [...prev, filter],
                        );
                      }}>
                      <Text
                        style={[
                          styles.filterOptionText,
                          tempActiveFilters.includes(filter) &&
                            styles.filterOptionTextActive,
                        ]}>
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Mileage/Distance Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Mileage</Text>
                <View style={styles.filterSliderContainer}>
                  <Text style={styles.filterSliderLabel}>
                    {tempDistance || 10} km
                  </Text>
                  <Slider
                    style={styles.filterSlider}
                    minimumValue={1}
                    maximumValue={1000}
                    step={1}
                    value={tempDistance || 10}
                    onValueChange={handleSliderChange}
                    onSlidingComplete={handleSliderComplete}
                    minimumTrackTintColor={Colors.primary}
                    maximumTrackTintColor="gray"
                    thumbTintColor={Colors.primary}
                  />
                </View>
              </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.filterActionButtons}>
                  <TouchableOpacity
                    style={styles.resetFiltersButton}
                    onPress={resetFilters}>
                    <Text style={styles.resetFiltersButtonText}>Reset Filters</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyFilterButton}
                    onPress={applyFilters}>
                    <Text style={styles.applyFilterButtonText}>Filter</Text>
                  </TouchableOpacity>
                </View>
              </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList
        data={noDataFound ? [] : sortedData}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            <Banner navigation={navigation} />
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Image
                  source={require('../../assets/search.png')}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search cars..."
                  placeholderTextColor={Colors.gray}
                  defaultValue={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity
                  style={styles.filterIconButton}
                  onPress={openFilterModal}>
                  <Image
                    source={require('../../assets/Filter_icon.png')}
                    style={styles.filterIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No carListings found for the selected filters.
          </Text>
        </View>
        }
          showsVerticalScrollIndicator={false}
        keyExtractor={item => item?._id || Math.random().toString()}
          contentContainerStyle={styles.list}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    paddingHorizontal: wp(4),
    height: 55,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    width: wp(5),
    height: wp(5),
    resizeMode: 'contain',
    marginRight: wp(2),
    tintColor: Colors.black,
  },
  searchInput: {
    flex: 1,
    fontSize: wp(4),
    fontFamily: Fonts.regular,
    color: Colors.black,
    paddingLeft:5,
  },
  filterIconButton: {
    paddingRight:4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterIcon: {
    width: wp(5),
    height: wp(5),
    resizeMode: 'contain',
    tintColor: Colors.black
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
    paddingTop: hp(4),
    paddingHorizontal: wp(3.5),
    paddingBottom: hp(0.5),
    shadowColor: Colors.black,
    shadowOpacity: 0.15,
    shadowRadius: wp(2),
    shadowOffset: { width: 0, height: hp(1) },
    elevation: 5,
    borderColor: 'white',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    marginBottom: hp(1),
  },
  label: {
  fontSize: wp(3.5), 
  color: Colors.darkGray ,
  fontWeight:'700'
  },
  value: {
    fontSize: wp(3.5), 
    color: Colors.darkGray, 
    fontFamily: Fonts.bold 
  },
  heartIcon: {
    width: wp(7),
    height: wp(7),
  },
  heartTagContainer: {
    position: 'absolute',
    top: hp(3),
    left: wp(6),
  },
  carImageContainer: {
    position: 'absolute',
    top: 8,
    right: 20,
    zIndex: 1,
    resizeMode: 'contain',
  },
  carImage: {
    width: 70,
    height: 70,
  },
  detailsContainer: {
    padding: wp(2.5),
  },
scrapText: {
     color: 'black', 
    fontSize: 15,
    fontWeight:'500'
  },
  scrapTag:{
      backgroundColor: '#1e1e1b10',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 100,
      marginTop:30
    },
  
  carTitle: {
     fontSize: wp(4),
    fontFamily: Fonts.bold,
    fontWeight:'600',
    color: Colors.primary,
    paddingVertical: hp(1),
    paddingTop:40
  },
   titleContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical:3,
    paddingTop:8
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
  details: {
    fontSize: wp(3.5),
    color: Colors.textGray,
  },
    separator: {
    width: 1,
    backgroundColor: '#D1D1D1',
    marginHorizontal: wp(2),
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
  },
  footerText: {
    marginTop: wp(2),
    fontFamily: Fonts.regular,
    fontSize: wp(3),
    color: Colors.gray,
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
    shadowOffset: {width: 0, height: 2},
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
    fontSize: wp(4.5),
    paddingHorizontal: wp(2),
    paddingVertical: wp(1),
    fontFamily: Fonts.bold,
  },
  // Filter Modal Styles
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    maxHeight: hp(80),
    paddingBottom: Platform.OS === 'ios' ? hp(4) : hp(2),
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  filterModalTitle: {
    fontSize: wp(7),
    fontFamily: Fonts.bold,
    fontWeight:'700',
    color: Colors.black,
  },
  filterScrollView: {
    maxHeight: hp(60),
    paddingHorizontal: wp(5),
  },
  filterSection: {
    marginTop: hp(1.5),
    marginBottom: hp(1.5),
  },
  filterSectionTitle: {
    fontSize: wp(5),
    fontFamily: Fonts.semiBold,
    fontWeight:'600',
    color: Colors.black,
    marginBottom: hp(1.5),
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  filterOptionButton: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.2),
    borderRadius: wp(5),
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    marginBottom: hp(1),
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: wp(3.8),
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
  filterOptionTextActive: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
  },
  filterSliderContainer: {
    marginTop: hp(1),
  },
  filterSliderLabel: {
    fontSize: wp(4),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: hp(1),
  },
  filterSlider: {
    width: '100%',
    height: 15,
  },
  filterActionButtons: {
    flexDirection: 'row',
    marginHorizontal: wp(5),
    marginTop: hp(2),
    gap: wp(3),
  },
  resetFiltersButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: hp(2),
    borderRadius: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetFiltersButtonText: {
    fontSize: wp(4.5),
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  applyFilterButton: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingVertical: hp(2),
    borderRadius: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFilterButtonText: {
    fontSize: wp(4.5),
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
});

export default Listings;
