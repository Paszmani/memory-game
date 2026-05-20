import React, { memo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/constants/colors';

interface Props {
  children:     React.ReactNode;
  scroll?:      boolean;
  padded?:      boolean;
  style?:       ViewStyle;
  contentStyle?: ViewStyle;
}

export const ScreenContainer = memo(({
  children,
  scroll       = true,
  padded       = true,
  style,
  contentStyle,
}: Props) => {
  const paddingStyle: ViewStyle = padded ? styles.padded : {};

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, paddingStyle, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, style]}>
      <StatusBar style="light" />
      <View style={[styles.flex, paddingStyle, contentStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
});

ScreenContainer.displayName = 'ScreenContainer';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    gap:      16,
  },
  padded: {
    padding: 20,
  },
});