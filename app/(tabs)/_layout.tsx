import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';

import { Colors } from '@/theme/colors';

export default function TabLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
        tabBarInactiveTintColor: Colors.labelSecondary,
        tabBarStyle: { backgroundColor: Colors.bgElevated, borderTopColor: Colors.separator },
        headerStyle: { backgroundColor: Colors.bgElevated },
        headerTintColor: Colors.label,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Nearby',
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rate-tab"
        options={{
          title: 'Rate',
          tabBarIcon: ({ size }) => <Ionicons name="add-circle" size={size + 6} color={Colors.tint} />,
        }}
        listeners={{
          // The center tab is a launcher, not a screen — it opens the rate modal.
          tabPress: (e) => {
            e.preventDefault();
            router.push('/rate');
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
