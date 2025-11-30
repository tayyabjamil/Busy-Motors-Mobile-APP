
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
        <Text style={styles.scrapText}>{item.tag || 'Unknown'}</Text>
      </TouchableOpacity>

      {/* Car Image */}
      <Image source={{ uri: item?.displayImage }} style={styles.carImage} resizeMode="contain" />

      {/* Car Details */}
      <View style={styles.detailsContainer}>
        {/* Car title remains in same place */}
        <Text style={styles.carTitle}>
          {item.make} {item.model} ({item.yearOfManufacture})
        </Text>

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
    shadowOpacity: 0.15,
    shadowRadius: wp(2),
    shadowOffset: { width: 0, height: hp(1) },
    elevation: 5,
    borderColor:'white'
  },
  heartTagContainer: {
    position: 'absolute',
    top: hp(2),
    left: wp(5),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: wp(10),
    paddingHorizontal: wp(3),
    paddingVertical: wp(1.5),
    zIndex: 2,
  },
  heartInTag: {
    width: wp(4),
    height: wp(4),
    marginRight: wp(2),
  },
  scrapText: {
    fontFamily: Fonts.regular,
    color: Colors.white,
    fontSize: wp(4.5),
    fontWeight:'400',
    textTransform: 'capitalize',
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


// import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
// import React, {useEffect, useState} from 'react';
// import {useNavigation} from '@react-navigation/native';
// import Colors from '../Helper/Colors';
// import {hp, wp} from '../Helper/Responsive';
// import {Fonts} from '../Helper/Fonts';
// import {useDispatch, useSelector} from 'react-redux';
// import {RequestLocationPermission} from '../Helper/Permisions';
// import Geolocation from 'react-native-geolocation-service';

// const localImages = {
//   car1: require('../assets/car.png'),
//   car2: require('../assets/car2.png'),
// };

// export default function CarList({
//   item,
//   onPress,
// }: {
//   item: any;
//   itemIndex: any;
//   onPress: any;
// }) {
//   const navigation = useNavigation();
//   const {favoriteItems} = useSelector((state: any) => state?.favourite);
//   const isFavorite = favoriteItems.includes(item._id);
//   const [currentLocation, setCurrentLocation] = useState({
//     latitude: null,
//     longitude: null,
//   });
//   useEffect(() => {
//     getLocation();
//   }, []);
//   const getLocation = async () => {
//     const hasLocationPermission = await RequestLocationPermission();
//     if (hasLocationPermission === 'granted') {
//       Geolocation.getCurrentPosition(
//         position => {
//           const {latitude, longitude} = position.coords;
//           setCurrentLocation({latitude, longitude});
//         },
//         error => {
//           console.error(error);
//         },
//         {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
//       );
//     }
//   };

//   const getTimeAgo = dateString => {
//     const dateAdded = new Date(dateString);
//     const now = new Date();
//     const diffInMs = now - dateAdded;
//     const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
//     const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
//     const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

//     if (diffInMinutes < 60) {
//       return `${diffInMinutes} minutes ago`;
//     } else if (diffInHours < 24) {
//       return `${diffInHours} hours ago`;
//     } else {
//       return `${diffInDays} days ago`;
//     }
//   };

//   const timeAgo = getTimeAgo(item.date_added);
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const latDiff = lat2 - lat1;
//     const lonDiff = lon2 - lon1;
//     const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 69;
//     return distance.toFixed(1) + ' mi';
//   };
//   let distance = 'N/A';
//   if (
//     currentLocation.latitude &&
//     currentLocation.longitude &&
//     item.latitude &&
//     item.longitude
//   ) {
//     distance = calculateDistance(
//       currentLocation.latitude,
//       currentLocation.longitude,
//       item.latitude,
//       item.longitude,
//     );
//   }
//   return (
//     <TouchableOpacity
//       onPress={() => navigation.navigate('CarDeatils', {car: item})}
//       style={styles.listingCard}>
//       {/* Heart Icon (Top-right corner) */}
//       <TouchableOpacity style={styles.heartIconContainer} onPress={onPress}>
//         <Image
//           source={
//             isFavorite
//               ? require('../assets/heart.png')
//               : require('../assets/simpleHeart.png')
//           }
//           style={styles.heartIcon}
//         />
//       </TouchableOpacity>
//       {/* Car Image */}
//       <Image
//         // source={getLocalImage(itemIndex)}
//         source={{uri: item?.displayImage}}
//         style={styles.carImage}
//         resizeMode="contain"
//       />

//       {/* Car Details */}
//       <View style={styles.detailsContainer}>
//         <View style={styles.carTagContainer}>
//           <Text style={styles.scrapText}>{item.tag || 'Unknown'}</Text>
//         </View>
//         <Text style={styles.carTitle}>
//           {item.make} {item.model} ({item.yearOfManufacture})
//         </Text>
//         {[
//           ['Registration:', item.registrationNumber],
//           ['Year:', item.yearOfManufacture],
//           ['Postcode:', item.postcode],
//           ['Colour:', item.color],
//           ['Model:', item.model],
//           ['Fuel Type:', item.fuelType],
//           // ['Phone:', car.phoneNumber ? `+${car.phoneNumber}` : 'N/A'],
//           // ['MOT Status:', car.motStatus],
//           // ['MOT Expiry:', car.motExpiryDate || 'No issues reported'],
//         ].map(([label, value], index) => (
//           <View key={index} style={styles.infoRow}>
//             <Text style={styles.label}>{label} dsfasdfasdf</Text>
//             <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
//               {value?.toString().toUpperCase() || 'N/A'}
//             </Text>
//           </View>
//         ))}
//         {/* <Text style={styles.details}>
//              Registration: {item.registrationNumber}
//            </Text>
//            <Text style={styles.details}>Postcode: {item.postcode}</Text>
//            <Text style={styles.details}>
//              Engine Capacity: {item.engineCapacity} cc
//            </Text>
//            <Text style={styles.details}>Fuel Type: {item.fuelType}</Text>
//            <Text style={styles.details}>Problem: {item.problem}</Text>
//       */}
//         {/* Footer */}
//         <View style={styles.footer}>
//           <View style={{alignItems: 'center'}}>
//             <Image source={require('../assets/pin.png')} style={styles.icon} />
//             <Text style={styles.footerText}>{distance}</Text>
//           </View>
//           <View style={{alignItems: 'center'}}>
//             <Image
//               source={require('../assets/timer.png')}
//               style={styles.icon}
//             />
//             <Text style={styles.footerText}>{timeAgo}</Text>
//           </View>
//           <View style={{alignItems: 'center'}}>
//             <Image source={require('../assets/eye.png')} style={styles.icon} />
//             <Text style={styles.footerText}>{item?.views?.length}</Text>
//           </View>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// }
// const styles = StyleSheet.create({
//   listingCard: {
//     backgroundColor: Colors.white,
//     borderRadius: wp(4),
//     borderWidth: 0.2,
//     marginTop: hp(5),
//     paddingTop: hp(3.5),
//     paddingHorizontal: wp(3.5),
//     paddingBottom: hp(2),
//     shadowColor: Colors.black,
//     shadowOpacity: 0.1,
//     shadowRadius: wp(1),
//     shadowOffset: {width: 0, height: hp(0.5)},
//     elevation: 3,
//   },
//   heartIconContainer: {
//     position: 'absolute',
//     top: hp(2),
//     left: wp(7),
//     zIndex: 1,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '90%',
//     alignSelf: 'center',
//     marginBottom: hp(1),
//   },
//   label: {
//     fontSize: wp(4),
//     color: Colors.darkGray,
//     minWidth: wp(30),
//     textAlign: 'right',
//     paddingRight: wp(3),
//   },
//   value: {
//     fontSize: wp(4),
//     color: Colors.darkGray,
//     fontFamily: Fonts.bold,
//     width: '65%',
//   },
//   heartIcon: {
//     width: wp(5.5),
//     height: wp(5.5),
//   },
//   carImage: {
//     position: 'absolute',
//     top: -hp(4),
//     right: wp(2),
//     width: '50%',
//     height: '50%',
//     zIndex: 1,
//     resizeMode: 'contain',
//   },
//   detailsContainer: {
//     padding: wp(2.5),
//   },
//   carTagContainer: {
//     backgroundColor: Colors.primary,
//     borderRadius: wp(10),
//     paddingHorizontal: wp(2),
//     alignSelf: 'flex-start',
//     marginTop: wp(3),
//   },
//   scrapText: {
//     textTransform: 'capitalize',
//     fontFamily: Fonts.regular,
//     paddingHorizontal: wp(3),
//     paddingVertical: wp(2),
//     textAlign: 'center',
//     color: Colors.white,
//   },
//   carTitle: {
//     fontSize: wp(4.5),
//     fontFamily: Fonts.bold,
//     color: Colors.primary,
//     paddingVertical: hp(1),
//   },
//   details: {
//     fontSize: wp(3.5),
//     color: Colors.textGray,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: hp(1),
//   },
//   footerText: {
//     marginTop: wp(2),
//     fontFamily: Fonts.regular,
//     fontSize: wp(3),
//     color: Colors.black,
//   },
//   icon: {
//     width: wp(4),
//     resizeMode: 'contain',
//     height: wp(4),
//     tintColor: Colors.black,
//   },
// });
