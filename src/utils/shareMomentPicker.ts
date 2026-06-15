import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 4],
  quality: 0.8,
};

export const pickMomentImage = (): Promise<string | null> =>
  new Promise((resolve) => {
    const openCamera = async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera access needed', 'Allow camera access or choose a photo from your gallery.');
        resolve(null);
        return;
      }
      const result = await ImagePicker.launchCameraAsync(pickerOptions);
      resolve(!result.canceled && result.assets[0] ? result.assets[0].uri : null);
    };

    const openGallery = async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photos access needed', 'Allow photo library access to share a moment.');
        resolve(null);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      resolve(!result.canceled && result.assets[0] ? result.assets[0].uri : null);
    };

    Alert.alert('Share a moment', 'Take a photo or pick one from your gallery', [
      { text: 'Take photo', onPress: () => openCamera().then(resolve) },
      { text: 'Choose photo', onPress: () => openGallery().then(resolve) },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
