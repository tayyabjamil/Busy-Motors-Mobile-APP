import ImagePicker from 'react-native-image-crop-picker';
import {RequestGalleryPermission} from '../Permissions/GalleryPermission';

const selectImage = async onDocumentSelected => {
  const result = await RequestGalleryPermission();
  if (result == 'granted') {
    ImagePicker.openPicker({
      cropping: true,
      compressImageQuality: 1,
    })
      .then(image => {
        let document = {
          name: image?.filename || `temp_image_${Date.now()}.jpg`,
          type: image?.mime,
          uri: image?.path,
        };
        onDocumentSelected(document);
      })
      .catch(error => {
        console.log('Media Manager Select Image', error);
      });
  }
};

const takePicture = async onDocumentSelected => {
  try {
    const result = await RequestGalleryPermission();
    if (result === 'granted') {
      ImagePicker.openCamera({
        compressImageQuality: 1,
        mediaType: 'photo',
      })
        .then(image => {
          let photo = {
            uri: image?.path,
            type: image?.mime,
            name: image?.filename || `temp_image_${Date.now()}.jpg`,
          };
          onDocumentSelected(photo);
        })
        .catch(e => {
          if (e.message === 'User cancelled image selection') {
            console.log('User cancelled image selection');
          } else {
            console.error(e);
          }
        });
    }
  } catch (error) {
    console.error('Error in takePicture:', error);
  }
};

export {selectImage, takePicture};
