import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Helper/Colors';
import { hp, wp } from '../Helper/Responsive';
import { Fonts } from '../Helper/Fonts';
import { useSelector } from 'react-redux';
import { RequestLocationPermission } from '../Helper/Permisions';
import Geolocation from 'react-native-geolocation-service';
import { getDistance } from 'geolib';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Default car image fallback
const defaultCarImage = require('../assets/car2.png');

// Function to get car image data (actual photo or brand logo fallback)
const getCarImageData = (make: string, carImage: string) => {
  // If car has a valid image from API, use it
  if (carImage && carImage !== 'N/A') {
    return { source: { uri: carImage }, isLogo: false };
  }

  const normalizedMake = make?.toLowerCase().trim();

  const makeToImageMap: { [key: string]: any } = {
    'aston martin': require('../assets/cars/astonmartin.png'),
    'astonmartin': require('../assets/cars/astonmartin.png'),
    'baic': require('../assets/cars/baic.png'),
    'bmw': require('../assets/cars/bmw.png'),
    'bugatti': require('../assets/cars/bugatti.png'),
    'chevrolet': require('../assets/cars/chevrolet.png'),
    'citroen': require('../assets/cars/citroen.png'),
    'dacia': require('../assets/cars/dacia.png'),
    'daihatsu': require('../assets/cars/daihatsu.png'),
    'dodge': require('../assets/cars/dodge.png'),
    'dongfeng': require('../assets/cars/dongfeng.png'),
    'ford': require('../assets/cars/ford.png'),
    'honda': require('../assets/cars/honda.png'),
    'hyundai': require('../assets/cars/hyundai.png'),
    'kia': require('../assets/cars/kia.png'),
    'lamborghini': require('../assets/cars/lamborghini.png'),
    'lotus': require('../assets/cars/lotus.png'),
    'mazda': require('../assets/cars/mazda.png'),
    'mclaren': require('../assets/cars/mclaren.png'),
    'mercedes': require('../assets/cars/mercedes-benz.png'),
    'mercedes-benz': require('../assets/cars/mercedes-benz.png'),
    'mercedesbenz': require('../assets/cars/mercedes-benz.png'),
    'mg': require('../assets/cars/mg.png'),
    'mini': require('../assets/cars/mini.png'),
    'nissan': require('../assets/cars/nissan.png'),
    'opel': require('../assets/cars/opel.png'),
    'proton': require('../assets/cars/proton.png'),
    'rolls royce': require('../assets/cars/rollsroyce.png'),
    'rollsroyce': require('../assets/cars/rollsroyce.png'),
    'rolls-royce': require('../assets/cars/rollsroyce.png'),
    'saic': require('../assets/cars/saic.png'),
    'skoda': require('../assets/cars/skoda.png'),
    'suzuki': require('../assets/cars/suzuki.png'),
    'tesla': require('../assets/cars/tesla.png'),
    'vauxhall': require('../assets/cars/vauxhall.png'),
    'volkswagen': require('../assets/cars/volkswagen.png'),
    'volvo': require('../assets/cars/volvo.png'),
    'xpeng': require('../assets/cars/xpeng.png'),
  };

  if (normalizedMake && makeToImageMap[normalizedMake]) {
    return { source: makeToImageMap[normalizedMake], isLogo: true };
  }

  return { source: defaultCarImage, isLogo: true };
};

export default function CarList({ item, onPress, removeLogo = false }: { item: any; onPress: any; removeLogo?: boolean }) {
  const navigation = useNavigation();
  const { favoriteItems } = useSelector((state: any) => state?.favourite);
  const isFavorite = favoriteItems.includes(item._id);

  const [currentLocation, setCurrentLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });

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
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    }
  };

  const getTimeAgo = (dateString: string) => {
    const dateAdded = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - dateAdded.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${diffInDays} days ago`;
  };

  const timeAgo = getTimeAgo(item.date_added);

  let distance = 'N/A';
  if (currentLocation.latitude && currentLocation.longitude && item.latitude && item.longitude) {
    const distanceInMeters = getDistance(
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
      { latitude: item.latitude, longitude: item.longitude },
    );
    distance = (distanceInMeters * 0.000621371).toFixed(1) + ' mi';
  }

  const motDueRaw = item.motDue || item.mot_due || item.motExpiry;
  const motDueDate = motDueRaw
    ? new Date(motDueRaw)
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      .toUpperCase()
    : null;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('CarDeatils', { car: item })}
      style={styles.listingCard}>

      {/* Top Row: Heart | Registration | Brand Logo */}
      <View style={styles.cardTopRow}>
        <TouchableOpacity onPress={onPress}>
          <Image
            source={isFavorite ? require('../assets/heart.png') : require('../assets/simpleHeart.png')}
            style={styles.heartIcon}
          />
        </TouchableOpacity>

        {item.isSold && <Text style={styles.soldText}>SOLD</Text>}

        {(() => {
          const imageData = getCarImageData(item?.make, item?.carImage);
          return (
            <Image
              source={imageData.source}
              resizeMode={imageData.isLogo ? 'contain' : 'cover'}
              style={[styles.brandLogo, !imageData.isLogo && styles.carPhoto]}
            />
          );
        })()}
      </View>

      {/* Title + Tag Row */}
      <View style={[styles.titleTagRow, item.isSold && { opacity: 0.5 }]}>
        <Text style={styles.carTitle} numberOfLines={1}>
          {item.make?.toUpperCase()} {item.model?.toUpperCase()} ({item.yearOfManufacture})
        </Text>
        <View style={styles.scrapTag}>
          <Text style={styles.scrapText}>{item.tag || 'Unknown'}</Text>
        </View>
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
            <Text style={styles.value}>{item.transmissionType || item.transmission || 'N/A'}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoColumn}>
            <MaterialCommunityIcons name="gas-station" size={wp(5)} color={Colors.primary} style={styles.infoIcon} />
            <Text style={styles.label}>FUEL TYPE</Text>
            <Text style={styles.value}>{item.fuelType || 'N/A'}</Text>
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
            <MaterialIcons name="location-on" size={wp(5)} color={Colors.primary} style={styles.infoIcon} />
            <Text style={styles.label}>POSTCODE</Text>
            <Text style={styles.value}>{item.postcode?.toString().toUpperCase() || 'N/A'}</Text>
          </View>
        </View>

        {/* MOT DUE Row */}
        {motDueDate && (
          <View style={styles.motDueRow}>
            <Image source={require('../assets/timer.png')} style={styles.motIcon} />
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
          <Image source={require('../assets/pin.png')} style={[styles.footerItemIcon, item.isSold && { opacity: 0.5 }]} />
          <Text style={[styles.footerText, item.isSold && { opacity: 0.5 }]}>{distance}</Text>
        </View>
        <View style={styles.footerItem}>
          <Image source={require('../assets/timer.png')} style={[styles.footerItemIcon, item.isSold && { opacity: 0.5 }]} />
          <Text style={[styles.footerText, item.isSold && { opacity: 0.5 }]}>{timeAgo}</Text>
        </View>
        <View style={styles.footerItem}>
          <Image source={require('../assets/eye.png')} style={[styles.footerItemIcon, item.isSold && { opacity: 0.5 }]} />
          <Text style={[styles.footerText, item.isSold && { opacity: 0.5 }]}>{item?.views?.length}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listingCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 0.2,
    marginTop: 10,
    padding: wp(4),
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
  regNumber: {
    fontSize: wp(5.5),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.darkGray,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: wp(2),
  },
  soldText: {
    color: '#FF3B30',
    fontSize: wp(5.5),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  brandLogo: {
    width: 50,
    height: 50,
  },
  carPhoto: {
    borderRadius: 8,
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
    tintColor: Colors.gray,
  },
  footerText: {
    fontFamily: Fonts.regular,
    fontSize: wp(3),
    color: Colors.gray,
  },
});
