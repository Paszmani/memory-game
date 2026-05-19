import { Stack } from 'expo-router';

import { colors } from '@/constants/colors';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '800',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Jogo da Memória',
        }}
      />
      <Stack.Screen
        name="game/index"
        options={{
          title: 'Partida',
        }}
      />
      <Stack.Screen
        name="customize/index"
        options={{
          title: 'Customizar',
        }}
      />
      <Stack.Screen
        name="records/index"
        options={{
          title: 'Recordes',
        }}
      />
      <Stack.Screen
        name="settings/index"
        options={{
          title: 'Configurações',
        }}
      />
    </Stack>
  );
}