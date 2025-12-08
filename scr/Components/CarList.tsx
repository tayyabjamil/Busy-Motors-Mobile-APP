
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Helper/Colors';
import { hp, wp } from '../Helper/Responsive';
import { Fonts } from '../Helper/Fonts';
import { useSelector } from 'react-redux';
import { RequestLocationPermission } from '../Helper/Permisions';
import Geolocation from 'react-native-geolocation-service';

export default function CarList({ item, onPress }: { item: any; onPress: any }) {
  const navigation = useNavigation();
  const { favoriteItems } = useSelector((state: any) => state?.favourite);
  const isFavorite = favoriteItems.includes(item._id);

  const [currentLocation, setCurrentLocation] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    const hasLocationPermission = await RequestLocationPermission();
    if (hasLocationPermission === 'granted') {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
        },
        error => {
          console.error(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
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

  const timeAgo = getTimeAgo(item.date_added);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const latDiff = lat2 - lat1;
    const lonDiff = lon2 - lon1;
    const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 69;
    return distance.toFixed(1) + ' mi';
  };

  let distance = 'N/A';
  if (currentLocation.latitude && currentLocation.longitude && item.latitude && item.longitude) {
    distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      item.latitude,
      item.longitude
    );
  }

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('CarDeatils', { car: item })}
      style={styles.listingCard}
    >
      {/* Heart + Scrap Tag in top-left (clickable) */}
      <TouchableOpacity style={styles.heartTagContainer} onPress={onPress}>
        <Image
          source={isFavorite ? require('../assets/heart.png') : require('../assets/simpleHeart.png')}
          style={styles.heartInTag}
        />
        
      </TouchableOpacity>

      {/* Car Image */}
      <Image source={{ uri: item?.displayImage }} style={styles.carImage} resizeMode="contain" />

      {/* Car Details */}
      <View style={styles.detailsContainer}>
        {/* Car title remains in same place */}
        <View
  style={styles.titleContainer}>
  
  {/* LEFT SIDE - CAR NAME */}
  <Text
    style={[styles.carTitle, {flexShrink: 1, marginRight: 10}]}
    numberOfLines={1}>
    {item.make} {item.model} ({item.yearOfManufacture})
  </Text>
  {/* RIGHT SIDE - SCRAP TAG */}
  <View
    style={styles.scrapTag}>
    <Text style={styles.scrapText}>
      {item.tag || 'Unknown'}
    </Text>
  </View>
</View>


        {/* Info Boxes with vertical separator */}
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
            <Text style={styles.value}>{item.postcode || 'N/A'}</Text>
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
            <Image source={require('../assets/pin.png')} style={styles.icon} />
            <Text style={styles.footerText}>{distance}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Image source={require('../assets/timer.png')} style={styles.icon} />
            <Text style={styles.footerText}>{timeAgo}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Image source={require('../assets/eye.png')} style={styles.icon} />
            <Text style={styles.footerText}>{item?.views?.length}</Text>
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listingCard: {
    backgroundColor: Colors.white,
    borderRadius: wp(5),
    borderWidth: 0.2,
    marginTop: hp(2),
    paddingTop: hp(4),
    paddingHorizontal: wp(3.5),
    paddingBottom: hp(0.5),
    shadowColor: Colors.black,
    shadowRadius: wp(2),
    shadowOffset: { width: 0, height: hp(1) },
    elevation: 5,
    borderColor:'white'
  },
  heartTagContainer: {
    position: 'absolute',
    top: hp(3),
    left: wp(6),
  },
  heartInTag: {
    width: wp(6),
    height: wp(6),
  },
  titleContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical:3
  },
  scrapText: {
    color: 'black', 
    fontSize: 15,
    fontWeight:'500'
  },
  carImage: {
    position: 'absolute',
    top: -hp(3.3),
    right: wp(4),
    width: '40%',
    height: '40%',
    zIndex: 1,
    resizeMode: 'contain',
  },
  detailsContainer: {
    padding: wp(2.5),
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    padding: wp(3),
    borderRadius: wp(3),
    marginBottom: hp(1),
    alignItems: 'center',
  },
  infoColumn: { flex: 1, paddingHorizontal: wp(1) },
  label: { fontSize: wp(3.5), color: Colors.darkGray ,fontWeight:'700' },
  value: { fontSize: wp(3.5), color: Colors.darkGray, fontFamily: Fonts.bold },
  separator: {
    width: 1,
    backgroundColor: '#D1D1D1',
    marginHorizontal: wp(2),
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(0.5),
  },
  icon: {
    width: wp(4),
    resizeMode: 'contain',
    height: wp(4),
    tintColor: Colors.black,
  },
  footerText: {
    marginTop: wp(1),
    fontFamily: Fonts.regular,
    fontSize: wp(3),
    color: Colors.black,
  },
});
