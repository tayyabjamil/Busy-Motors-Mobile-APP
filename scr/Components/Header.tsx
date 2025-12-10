import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import Colors from '../Helper/Colors';
import { hp, wp } from '../Helper/Responsive';
import { useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';
import { Text } from 'react-native-gesture-handler';

export default function Header({
  textData,
  navigation,
  showNotification,
  showBackButton = false,
}: {
  navigation?: any;
  showNotification?: any;
  showBackButton?: boolean;
  textData?: string;
}) {
  const { userData } = useSelector((state: any) => state.user);
  return (
    <View style={styles.headerContainer}>
      {/* Left Side: Back Button */}
      <View style={styles.leftSection}>
        {showBackButton && navigation && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/back.png')}
              style={styles.iconBack}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.midSection} >
        <Text style={styles.textData}> {textData}</Text>
      </View>
      <View style={styles.rightSection} />
      {showNotification && (
        <TouchableOpacity
          style={styles.bellContainer}
          onPress={() => {
            if (userData?.is_guest) {
              Toast.show(
                'You’re logged in as a guest. Please log in to access notifications.',
                Toast.LONG,
              );
            } else {
              navigation.navigate('Notifications');
            }
          }}>
          <Image
            source={require('../assets/bellEmpty.png')}
            style={styles.bellIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.5),
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderTopWidth:1,
    borderBottomWidth:1,
    borderColor:Colors.lightGray,
    marginTop: hp(1.5),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp(2),
    width: wp(12),
  },
  backButton: {
    marginRight: wp(1),
    backgroundColor: 'white',
    padding: 8,
    marginLeft: 15,
    borderRadius: 100,
    borderColor: 'white',
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  iconBack: {
    width: wp(5),
    height: wp(5),
    resizeMode: 'contain',
  },
  titleText: {
    fontSize: wp(4.5),
    color: Colors.black,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenName: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  rightSection: {
    width: wp(30),
  },
  midSection: {
    marginLeft: 50,
  },
  textData: {
    fontSize: 20,
    fontWeight: '500'
  },
  bellIcon: {
    width: wp(6),
    height: wp(6),
    resizeMode: 'contain',
  },
  bellContainer: {
    position: 'absolute',
    right: 25
  }
});
