import * as ImageManipulator from 'expo-image-manipulator';

/** Compress to a JPEG data URL small enough for Firestore (no Storage needed). */
export const compressImageForFirestore = async (localUri: string): Promise<string> => {
  const result = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 720 } }],
    {
      compress: 0.55,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!result.base64) {
    throw new Error('Could not prepare image for upload');
  }

  return `data:image/jpeg;base64,${result.base64}`;
};
