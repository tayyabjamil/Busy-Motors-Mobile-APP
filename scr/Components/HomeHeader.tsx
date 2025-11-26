import {View, StyleSheet, Image, TouchableOpacity, Text} from 'react-native';
import React from 'react';
import Colors from '../Helper/Colors';
import {hp, wp} from '../Helper/Responsive';

export default function SubcriptionsHeader({
  navigation,
  centerContent,
}: {
  navigation: any;
  centerContent: string;
}) {
  return (
    <View style={styles.headerContainer}>
      {/* Left Side: Back Button */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.4}>
          <Image
            source={require('../assets/left-arrow.png')}
            style={styles.iconBack}
            tintColor={Colors?.backIconColor}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.centerSection}>
        <Text style={styles.screenName}>{centerContent}</Text>
      </View>

      <View style={styles.rightSection} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp(3.5),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(29),
    paddingLeft: 15,
  },
  backButton: {
    marginRight: wp(1),
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
});
