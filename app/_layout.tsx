import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { LocationProvider } from '@/components/nearby/LocationProvider';
import { setupPwa } from '@/lib/pwa';
import { AppStoreProvider } from '@/store/AppStore';
import { Colors } from '@/theme/colors';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.bg,
    card: Colors.bgElevated,
    text: Colors.label,
    border: Colors.separator,
    primary: Colors.tint,
  },
};

export default function RootLayout() {
  useEffect(() => {
    setupPwa();
  }, []);

  return (
    <AppStoreProvider>
      <LocationProvider>
        <ThemeProvider value={navTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="bathroom/[id]" options={{ title: 'Bathroom', headerBackTitle: 'Back' }} />
            <Stack.Screen
              name="rate"
              options={{
                presentation: 'transparentModal',
                headerShown: false,
                animation: 'fade',
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </LocationProvider>
    </AppStoreProvider>
  );
}
