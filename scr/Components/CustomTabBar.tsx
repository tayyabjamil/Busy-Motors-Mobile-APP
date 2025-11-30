import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Colors from '../Helper/Colors';

const CustomTabBar = ({state, descriptors, navigation}) => {
  return (
    <View style={styles.wrapper}>
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
    position: 'absolute',   // float on top
    top: 680,                // distance from top
    left: 0,
    right: 0,
    zIndex: 1000,           // above screen content
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginHorizontal: 20,   // smaller horizontal margin
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  tabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  activeButton: {
    backgroundColor: Colors.primary,
  },
});
