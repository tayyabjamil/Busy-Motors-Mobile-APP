import {Dimensions} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export {wp, hp};

export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;