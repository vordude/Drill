import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#847b74" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#847b74',
          },
          headerTintColor: '#fff',
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
    </>
  );
}
