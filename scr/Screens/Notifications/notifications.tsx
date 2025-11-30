import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {hp, wp} from '../../Helper/Responsive';
import Colors from '../../Helper/Colors';
import {Fonts} from '../../Helper/Fonts';
import Header from '../../Components/Header';
import {useNavigation} from '@react-navigation/native';

const initialNotifications = [
  {
    id: '1',
    title: 'New Bid Received',
    description: 'You received a bid of £350 for your 2012 Ford Focus',
    time: '5 minutes ago',
    type: 'bid',
    isRead: false,
    carId: 'car123',
    bidAmount: 350,
  },
  {
    id: '2',
    title: 'Contact Viewed',
    description: 'A potential buyer viewed your contact information',
    time: '1 hour ago',
    type: 'contact',
    isRead: true,
    carId: 'car123',
  },
  {
    id: '3',
    title: 'Price Alert',
    description: 'Similar cars in your area are selling for £400-£450',
    time: '3 hours ago',
    type: 'alert',
    isRead: false,
  },
  {
    id: '4',
    title: 'Bid Accepted',
    description: 'You accepted a bid of £400 for your 2012 Ford Focus',
    time: '1 day ago',
    type: 'transaction',
    isRead: true,
    carId: 'car123',
    bidAmount: 400,
  },
  {
    id: '5',
    title: 'New Message',
    description: 'Buyer: "Is the car still available?"',
    time: '2 days ago',
    type: 'message',
    isRead: false,
    carId: 'car123',
    sender: 'buyer789',
  },
  {
    id: '6',
    title: 'Reminder',
    description: 'Your ad for the 2012 Ford Focus expires in 3 days',
    time: '2 days ago',
    type: 'reminder',
    isRead: true,
    carId: 'car123',
  },
  {
    id: '7',
    title: 'Payment Received',
    description: '£400 payment received for your 2012 Ford Focus',
    time: '1 week ago',
    type: 'payment',
    isRead: true,
    carId: 'car123',
    amount: 400,
  },
  {
    id: '8',
    title: 'New Offer',
    description: 'Scrap yard offered £300 for immediate collection',
    time: '1 week ago',
    type: 'offer',
    isRead: false,
    carId: 'car123',
    offerAmount: 300,
  },
];

const Notifications = () => {
  const [data, setData] = useState(initialNotifications);
  const navigation = useNavigation();
  const handleClearAll = () => {
    setData([]);
  };

  const renderItem = ({item}) => (
    <View style={styles.notificationCard}>
      <Image
        source={require('../../assets/profile.png')} // Replace with your image
        style={styles.avatar}
      />
      <View style={styles.notificationText}>
        <View style={styles.row}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header navigation={navigation} showNotification={false} textData={'Notifications'} />
      {/* Notification List */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    backgroundColor: '#F5F5F5',
  },
  list: {
    paddingBottom: hp(2),
    marginTop:10
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    padding: wp(4),
    borderRadius: wp(2),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 1},
    elevation: 2,
  },

  avatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginRight: wp(3),
    resizeMode: 'contain',
  },

  notificationText: {
    flex: 1,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },

  title: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },

  description: {
    fontSize: wp(3.4),
    color: '#666',
    lineHeight: hp(2.5),
  },

  time: {
    fontSize: wp(3.2),
    color: '#999',
    marginLeft: wp(2),
  },
  deleteButton: {
    width: wp(8),
    height: wp(8),
    backgroundColor: '#E0E0E0',
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: wp(4),
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: hp(10),
    fontSize: wp(4),
    color: '#999',
  },
});

export default Notifications;
