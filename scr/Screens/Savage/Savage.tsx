import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../Helper/Colors';
import {wp} from '../../Helper/Responsive';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import CarList from '../../Components/CarList';
import Header from '../../Components/Header';
import {getFavListingsRequest} from '../../redux/slices/favouriteListingSlice';
import { toggleFavoriteRequest } from '../../redux/slices/favouriteSlice';
import Toast from 'react-native-simple-toast';

const Savage = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const token = useSelector((state: any) => state.auth?.token);
  const {loading, error, data} = useSelector((state: any) => state.favListings);
   const {favoriteItems} = useSelector((state: any) => state?.favourite);

  useEffect(() => {
    if (isFocused) {
      dispatch(getFavListingsRequest(token));
    }
  }, [isFocused]);
  const handleToggle=(item)=>{
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Listings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header navigation={navigation} textData={'Favorites'}/>
       {filteredData?.length > 0 && (
    <Text style={styles.saved}>Your Saved Favorites</Text>
  )}
      {filteredData?.length > 0 ? (
        <FlatList
          data={filteredData}
          renderItem={({ item, index }) => (
            <CarList item={item} itemIndex={index} onPress={() => handleToggle(item)} />
          )}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item._id}
        />
      ) :  <View style={styles.noDataContainer}>
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
    paddingHorizontal: wp(5),
    backgroundColor: '#F5F5F5',
    margin: Platform.OS === 'ios' ? 20 : 5,
    marginTop:0,
    
  },
  saved:{
    paddingLeft:4,
    fontSize:15,
    fontWeight:'700',
    paddingTop:8
  },
noDataContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginTop: 40,

},

noDataImage: {
  width: 150,
  height: 150,
  opacity: 0.8,
},

noDataEmoji: {
  fontSize: 40,
  marginTop: 10,
},

noDataTitle: {
  fontSize: 20,
  fontWeight: '700',
  marginTop: 10,
  color: '#333',
},

noDataSubtitle: {
  fontSize: 14,
  textAlign: 'center',
  marginTop: 6,
  color: '#777',
  lineHeight: 20,
},

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.primary,
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
