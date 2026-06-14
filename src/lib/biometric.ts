import * as LocalAuthentication from 'expo-local-authentication';

export const canUseBiometrics = async (): Promise<boolean> => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
};

export const authenticateVault = async (): Promise<boolean> => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Private Vault',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  return result.success;
};
