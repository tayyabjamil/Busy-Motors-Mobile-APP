import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import Colors from '../Helper/Colors';
import {hp, wp} from '../Helper/Responsive';

interface Props {
  title: string;
  message: string;
  onPress: () => void;
  onClose: () => void;
}

const ForegroundNotification: React.FC<Props> = ({
  title,
  message,
  onPress,
  onClose,
}) => {
  const slideAnim = new Animated.Value(-hp(12));

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -hp(12),
        duration: 300,
        useNativeDriver: true,
      }).start(() => onClose());
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[styles.container, {transform: [{translateY: slideAnim}]}]}>
      <TouchableOpacity onPress={onPress} style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width: wp(95),
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: wp(2),
    marginTop: hp(2),
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  content: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  title: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: wp(4),
  },
  message: {
    color: Colors.primary,
    fontSize: wp(3.5),
    marginTop: hp(0.5),
  },
});

export default ForegroundNotification;
