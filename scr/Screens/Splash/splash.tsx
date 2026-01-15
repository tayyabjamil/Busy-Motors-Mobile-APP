import { Image, View, StyleSheet,Platform } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { wp } from '../../Helper/Responsive';
import { useSelector } from 'react-redux';
import { navigationRef } from '../../navigationRef';
import { CommonActions } from '@react-navigation/native';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

const Splash = () => {
  const token = useSelector((state: any) => state.auth.token);
  const soundRef = useRef<Sound | null>(null);

  console.log('💫 [Splash] Component rendered');
  console.log('💫 [Splash] Token from Redux:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    token: token ? `${token.substring(0, 20)}...` : 'null'
  });

  useEffect(() => {
    let isMounted = true; // prevent crash if component unmounts early

    const sound = new Sound(
      Platform.OS === 'ios'
        ? 'insta_startup.mp3'
        : 'insta_startup', // no extension for Android raw resources
      Platform.OS === 'ios' ? Sound.MAIN_BUNDLE : Sound.MAIN_BUNDLE,
      (error) => {
        if (error) {
          console.log('Sound load error:', error);
          navigate();
          return;
        }

        if (!isMounted) return;

        sound.play((success) => {
          if (!isMounted) return;

          if (success) console.log('Sound played successfully');
          else console.log('Sound playback failed');

          navigate();
        });
      }
    );

    soundRef.current = sound;

    return () => {
      isMounted = false;
      soundRef.current?.stop();
      soundRef.current?.release();
    };
  }, [token]);

  const navigate = () => {
    console.log('💫 [Splash] Navigating...', {
      hasToken: !!token,
      destination: token ? 'MainStack' : 'AuthStack'
    });

    if (navigationRef.isReady()) {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: token ? 'MainStack' : 'AuthStack' }],
        })
      );
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/splashLogo.png')}
        style={styles.logo}
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  logo: {
    width: wp(80),
    height: wp(80),
  },
});
