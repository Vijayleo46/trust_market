import { Platform } from 'react-native';

// Simple haptic feedback utility
export const hapticFeedback = {
  light: () => {
    if (Platform.OS === 'ios') {
      // On iOS, you can use Haptics API if available
      // For now, we'll use a simple implementation
      console.log('Light haptic feedback');
    }
  },
  
  medium: () => {
    if (Platform.OS === 'ios') {
      console.log('Medium haptic feedback');
    }
  },
  
  heavy: () => {
    if (Platform.OS === 'ios') {
      console.log('Heavy haptic feedback');
    }
  },
  
  selection: () => {
    if (Platform.OS === 'ios') {
      console.log('Selection haptic feedback');
    }
  }
};