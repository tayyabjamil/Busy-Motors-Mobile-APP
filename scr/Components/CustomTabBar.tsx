import React from 'react';
import {View, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Colors from '../Helper/Colors';
import {wp, hp} from '../Helper/Responsive';

const CustomTabBar = ({state, descriptors, navigation}) => {
  const insets = useSafeAreaInsets();

  // Calculate bottom spacing based on safe area
  const bottomSpacing = Platform.select({
    ios: insets.bottom > 0 ? insets.bottom + hp(1) : hp(2.5),
    android: hp(2),
  });

  return (
    <View style={[styles.wrapper, {bottom: bottomSpacing}]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          const icon = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[
                styles.tabButton,
                isFocused && styles.activeButton,
              ]}>
              {icon({focused: isFocused})}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    // bottom will be set dynamically based on safe area and platform
  },
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    marginHorizontal: wp(5),
    borderRadius: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: hp(0.5),
        },
        shadowOpacity: 0.15,
        shadowRadius: wp(2),
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp(1.5),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: hp(0.25),
        },
        shadowOpacity: 0.1,
        shadowRadius: wp(0.75),
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activeButton: {
    backgroundColor: Colors.primary,
  },
});
