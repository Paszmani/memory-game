import { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/constants/colors';

type ScreenContainerProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function ScreenContainer({
  children,
  scroll = true,
}: ScreenContainerProps) {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
});