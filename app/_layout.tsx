import { Stack } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#2c6e49' }} onLayout={onLayoutRootView}>
      <StatusBar style="light" backgroundColor="#2c6e49" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2c6e49',
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
    </View>
  );
}
