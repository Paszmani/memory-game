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
  children:      React.ReactNode;
  scroll?:       boolean;
  padded?:       boolean;
  style?:        ViewStyle;
  contentStyle?: ViewStyle;
  keyboardAware?: boolean;
}

export const ScreenContainer = memo(({
  children,
  scroll        = true,
  padded        = true,
  style,
  contentStyle,
  keyboardAware = true,
}: Props) => {
  const padding: ViewStyle = padded ? { padding: 20 } : {};

  const kvBehavior = Platform.select({
    ios:     'padding' as const,
    android: 'height'  as const,
    default: 'padding' as const,
  });

  const content = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, padding, contentStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padding, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, style]}>
      <StatusBar style="light" />
      {keyboardAware && Platform.OS !== 'web' ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={kvBehavior}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
});

ScreenContainer.displayName = 'ScreenContainer';

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    gap:      16,
  },
});