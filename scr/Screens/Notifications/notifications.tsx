import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {hp, wp} from '../../Helper/Responsive';
import {Fonts} from '../../Helper/Fonts';
import Header from '../../Components/Header';
import {useNavigation} from '@react-navigation/native';

const Notifications = () => {
  const [data, setData] = useState([]);
  const navigation = useNavigation();

  const renderItem = ({item}: {item: any}) => (
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header navigation={navigation} showBackButton showNotification={false} textData={'Notifications'} />
      {/* Notification List */}
      <View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Image
                source={require('../../assets/bellEmpty.png')}
                style={styles.emptyImage}
              />
            </View>
            <Text style={styles.emptyTitle}>No Notifications Yet</Text>
            <Text style={styles.emptyDescription}>
              You're all caught up! We'll notify you when there's something new — like updates on your saved cars or subscription alerts.
            </Text>
          </View>
        }
      />
       </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(20),
    paddingHorizontal: wp(10),
  },
  emptyIconContainer: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(3),
  },
  emptyImage: {
    width: wp(11),
    height: wp(11),
    resizeMode: 'contain',
    tintColor: '#9E9E9E',
  },
  emptyTitle: {
    fontSize: wp(5.5),
    fontWeight: '700',
    fontFamily: Fonts.bold,
    color: '#1A1A1A',
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: wp(3.8),
    fontFamily: Fonts.regular,
    color: '#757575',
    textAlign: 'center',
    lineHeight: hp(2.8),
    paddingHorizontal: wp(5),
  },
});

export default Notifications;
