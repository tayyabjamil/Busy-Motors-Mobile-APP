import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect } from 'react';
import Colors from '../../Helper/Colors';
import { hp, wp } from '../../Helper/Responsive';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CarList from '../../Components/CarList';
import Header from '../../Components/Header';
import { getFavListingsRequest } from '../../redux/slices/favouriteListingSlice';
import { toggleFavoriteRequest } from '../../redux/slices/favouriteSlice';
import Toast from 'react-native-simple-toast';
import { SafeAreaView } from 'react-native-safe-area-context';

const Savage = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const token = useSelector((state: any) => state.auth?.token);
  const { error, data } = useSelector((state: any) => state.favListings);
  const { favoriteItems } = useSelector((state: any) => state?.favourite);

  useEffect(() => {
    if (isFocused) {
      dispatch(getFavListingsRequest(token));
    }
  }, [isFocused]);
  const handleToggle = (item) => {
    const isFavorite = favoriteItems.includes(item._id);
    dispatch(toggleFavoriteRequest({ carId: item._id, token }));
    if (isFavorite) {
      dispatch(getFavListingsRequest(token));
      Toast.show(`${item.make} removed from Favorites`);
    } else {
      Toast.show(`${item.make} added to Favorites`);
    }
  }
  const filteredData = data?.filter((item) => favoriteItems.includes(item._id));

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['top', 'left', 'right']}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header navigation={navigation} showBackButton textData={'Favorites'} />

      {filteredData?.length > 0 ? (
        <View style={styles.pageSidePadding}>
          <Text style={[styles.saved]}>Your Saved Favorites</Text>
          <FlatList
            data={filteredData}
            renderItem={({ item }) => (
              <CarList item={item} onPress={() => handleToggle(item)} />
            )}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item._id}
          />
        </View>

      ) : <View style={styles.noDataContainer}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076549.png',
          }}
          style={styles.noDataImage}
          resizeMode="contain"
        />

        <Text style={styles.noDataEmoji}>💔</Text>

        <Text style={styles.noDataTitle}>No Favorites Yet</Text>

        <Text style={styles.noDataSubtitle}>
          You haven’t saved any cars.Start exploring and tap the heart to favorite!
        </Text>
      </View>}

    </SafeAreaView>
  );
};

export default Savage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  pageSidePadding: {
    paddingHorizontal: wp(6),
  },
  saved: {
    paddingLeft: 4,
    fontSize: 15,
    fontWeight: '700',
    paddingTop: 18,
    paddingBottom: 6,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(5),
  },

  noDataImage: {
    width: wp(40),
    height: wp(40),
    opacity: 0.8,
    alignSelf: 'center',
    marginBottom: hp(2),
  },

  noDataEmoji: {
    fontSize: wp(10),
    marginTop: hp(1),
    marginBottom: hp(1),
    textAlign: 'center',
    color: '#333',
  },

  noDataTitle: {
    fontSize: wp(5.5),
    fontWeight: '700',
    marginTop: hp(1),
    marginBottom: hp(1),
    color: '#333',
    textAlign: 'center',
  },

  noDataSubtitle: {
    fontSize: wp(3.8),
    textAlign: 'center',
    marginTop: hp(0.5),
    color: '#666',
    lineHeight: hp(3),
    maxWidth: wp(80),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});
