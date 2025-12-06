import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Platform,
  SafeAreaView,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Colors from '../../Helper/Colors';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Slider from '@react-native-community/slider';
import {hp, wp} from '../../Helper/Responsive';
import {Fonts} from '../../Helper/Fonts';
import {RequestLocationPermission} from '../../Helper/Permisions';
import Geolocation from 'react-native-geolocation-service';
import {getDistance} from 'geolib'; // Import geolib for distance calculation
import {getUserRequest} from '../../redux/slices/carListingsSlice';

const MapListings = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const token = useSelector((state: any) => state.auth?.token);
  const [selectedCar, setSelectedCar] = useState(null);
  const {data} = useSelector((state: any) => state.carListings);
  const [distance, setDistance] = useState(5); // Distance in kilometers
  const [currentLocation, setCurrentLocation] = useState({
    latitude: null,
    longitude: null,
  });
  useEffect(() => {}, []);
  useEffect(() => {
    if (isFocused) {
      dispatch(getUserRequest(token));
      getLocation();
    }
  }, [isFocused]);

  const getLocation = async () => {
    const hasLocationPermission = await RequestLocationPermission();
    if (hasLocationPermission === 'granted') {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setCurrentLocation({latitude, longitude});
        },
        error => {
          console.error(error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    }
  };
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
  const timeAgo = getTimeAgo(selectedCar?.date_added);
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
  const distanceCalculate = calculateDistance(
    currentLocation?.latitude,
    currentLocation?.longitude,
    selectedCar?.latitude,
    selectedCar?.longitude,
  );
  const closeModal = () => {
    setSelectedCar(null); // Close the modal
  };

  const handleModalContentPress = () => {
    // Navigate to CarDetails when modal content is pressed
    navigation.navigate('CarDeatils', {car: selectedCar});
    setSelectedCar(null); // Close the modal
  };

  const [region, setRegion] = useState({
    latitude: 51.451696,
    longitude: 0.190079,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Convert kilometers to miles
  const kilometersToMiles = km => {
    return km * 0.621371;
  };

  // Update the map region based on the distance
  // const updateRegion = distance => {
  //   const delta = distance / 50; // Adjust the delta based on distance
  //   setRegion({
  //     ...region,
  //     latitudeDelta: delta,
  //     longitudeDelta: delta,
  //   });
  // };
  const updateRegion = distance => {
    const delta = distance / 50;
    setRegion(prev => ({
      ...prev,
      latitudeDelta: delta,
      longitudeDelta: delta,
    }));
  };
  // Handle slider value change
  const handleSliderComplete = value => {
    setDistance(value);
    updateRegion(value);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {paddingTop: Platform.OS === 'ios' ? hp(2) : 0},
      ]}>
      {/* Map Section */}
      <View style={styles.sliderContainer} pointerEvents="box-none">
        <Text style={styles.label}>Distance</Text>
        <Text style={styles.distanceText}>
          {Math.min(kilometersToMiles(distance), 100).toFixed(0)} miles
          {/* {kilometersToMiles(distance).toFixed(0)} miles */}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={1000}
          step={1}
          value={distance}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor={Colors.gray}
          thumbTintColor={Colors.primary}
          onSlidingComplete={handleSliderComplete}
        />
      </View>

      <View style={styles.mapContainer}>
        <MapView style={styles.map} region={region}>
          {data?.map((car: any, index: any) => {
            return (
              <Marker
                key={car.uniqueId}
                coordinate={{
                  latitude: parseFloat(car.latitude),
                  longitude: parseFloat(car.longitude),
                }}
                title={`${car.make} ${car.model}`}
                description={
                  car.fuelType ? `Fuel Type: ${car.fuelType}` : 'No fuel type'
                }
                onPress={() => setSelectedCar(car)}
              />
            );
          })}
        </MapView>
      </View>

      {/* Bottom Modal */}
      <Modal visible={!!selectedCar} animationType="slide" transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}>
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={handleModalContentPress}>
            {/* Blue Header */}
            <View style={styles.header}>
              <Text
                style={styles.headerTitleStyle}
                numberOfLines={3}
                ellipsizeMode="tail">
                {selectedCar?.make} {selectedCar?.model}{' '}
                {selectedCar?.yearOfManufacture}
              </Text>

              <TouchableOpacity
                style={styles.crossContainer}
                onPress={() => setSelectedCar(false)}>
                <Image
                  source={require('../../assets/cross.png')}
                  tintColor={Colors.white}
                  resizeMode="contain"
                  style={{width: wp(4.5), height: wp(4.5)}}
                />
              </TouchableOpacity>

              <Image
                source={require('../../assets/landcruser.png')}
                style={styles.carImage}
              />
            </View>
            <View style={styles.featuresContainer}>
                <View style={styles.featureCard}>
                  <Image
                    source={require('../../assets/dashboard.png')}
                    style={styles.registericon}
                    tintColor={'#3A58E891'}
                    resizeMode="contain"
                  />
                  <Text style={styles.featureTitle}>Reg No.</Text>
                  <Text style={styles.featureSubText}>
                    {selectedCar?.registrationNumber || 'N/A'}
                  </Text>
                </View>
                <View style={styles.featureCard}>
                  <Image
                    source={require('../../assets/Fuel.png')}
                    style={styles.icon}
                    tintColor={Colors.primary}
                    resizeMode="contain"
                  />
                  <Text style={styles.featureTitle}>Fuel Type</Text>
                  <Text style={styles.featureSubText}>
                    {selectedCar?.fuelType}
                  </Text>
                </View>
                <View style={styles.featureCard}>
                  <Image
                    source={require('../../assets/Accelator.png')}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                  <Text style={styles.featureTitle}>Engine</Text>
                  <Text style={styles.featureSubText}>
                    {selectedCar?.engineCapacity} cc
                  </Text>
                </View>
              </View>
            {/* Features Section */}
            <View>
              <View style={styles.footer}>
                <View style={{alignItems: 'center'}}>
                  <Image
                    source={require('../../assets/pin.png')}
                    style={styles.footerIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.footerText}>{distanceCalculate}</Text>
                </View>
                <View style={{alignItems: 'center'}}>
                  <Image
                    source={require('../../assets/timer.png')}
                    style={styles.footerIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.footerText}>{timeAgo}</Text>
                </View>
              </View>
              
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  sliderContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    opacity: 0.8,
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    color: 'black',
    fontFamily: Fonts.bold,
  },
  distanceText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 20,
  },
  mapContainer: {flex: 1},
  map: {width: '100%', height: '100%'},

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  icon: {
    width: 20,
    height: 20,
    marginVertical: hp(1),
    alignSelf: 'center',
  },
  footerIcon: {
    width: wp(4),
    height: wp(4),
    marginTop: hp(1),
    alignSelf: 'center',
  },
  registericon: {
    width: 20,
    height: 20,
    marginVertical: hp(0.5),
    alignSelf:'center'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingBottom: 20,
  },
  // Header Section
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom:20
  },

  headerTitleStyle: {
    fontSize: 20,
    paddingRight: hp(3),
    fontFamily: Fonts.bold,
    width: wp(50),
    color: '#FFF',
  },

  headerSubText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  carImage: {
    width: 150,
    height: 100,
    resizeMode: 'contain',
    position: 'absolute',
    bottom: -30,
    right: 20,
  },

  // Features Section
  featuresContainer: {
    flexDirection: 'row',
    justifyContent:'space-evenly',
    margin: hp(2),
    marginBottom:hp(1)
  },
  featureCard: {
    alignItems: 'center',
    paddingVertical: wp(1.5),
    paddingHorizontal: wp(2),
    ...(Platform.OS === 'android'
      ? {elevation: 0}
      : {
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: {width: 0, height: 2},
          shadowRadius: 4,
        }),
    borderWidth:1,
    borderRadius:5,
    shadowColor: Colors.black,
    shadowOpacity: 0.15,
    shadowRadius: wp(2),
    shadowOffset: { width: 0, height: hp(1) },
    elevation: 5,
    borderColor:'white',
    backgroundColor:'white'
  },
  featureTitle: {
    fontSize: wp(3.8), 
    color: Colors.darkGray ,
    fontWeight:'700'
  },
  featureSubText: {
    fontSize: wp(3), 
    color: Colors.darkGray, 
    fontFamily: Fonts.bold 
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
   
  },
  footerText: {
    marginTop: wp(2),
    fontFamily: Fonts.regular,
    fontSize: wp(3.5),
    color: Colors.black,
  },
  crossContainer: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(4),
    backgroundColor: Colors.footerGray,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});

export default MapListings;
