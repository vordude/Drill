import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#2c6e49',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen 
        name="index"
        options={{ 
          title: 'Sow Smart',
        }}
      />
      <Stack.Screen 
        name="calibration"
        options={{
          title: 'Sow Smart',
          headerBackTitle: 'Settings',
        }}
      />
    </Stack>
  );
}
