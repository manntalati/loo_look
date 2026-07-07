import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

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
  return (
    <AppStoreProvider>
      <ThemeProvider value={navTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="bathroom/[id]" options={{ title: 'Bathroom', headerBackTitle: 'Back' }} />
          <Stack.Screen name="rate" options={{ presentation: 'modal', title: 'Rate a Bathroom' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </AppStoreProvider>
  );
}
