import React, { memo } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  keyboardAware?: boolean;
  maxContentWidth?: number;
}

export const ScreenContainer = memo(
  ({
    children,
    scroll = true,
    padded = true,
    style,
    contentStyle,
    keyboardAware = true,
    maxContentWidth = 960,
  }: Props) => {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const isWeb = Platform.OS === 'web';
    const isSmall = width < 380;
    const isTabletOrWeb = width >= 768;

    const horizontalPadding = padded
      ? isSmall
        ? 14
        : isTabletOrWeb
          ? 28
          : 20
      : 0;

    const responsiveContentStyle: ViewStyle = {
      paddingHorizontal: horizontalPadding,
      paddingTop: padded ? 16 : 0,
      paddingBottom: padded ? Math.max(32, insets.bottom + 24) : insets.bottom,
      width: '100%',
      maxWidth: isWeb ? maxContentWidth : undefined,
      alignSelf: 'center',
    };

    const content = scroll ? (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          responsiveContentStyle,
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    ) : (
      <View style={[styles.flex, responsiveContentStyle, contentStyle]}>
        {children}
      </View>
    );

    return (
      <SafeAreaView style={[styles.safe, style]}>
        <StatusBar style="light" />

        {keyboardAware && !isWeb ? (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 72 : 0}
          >
            {content}
          </KeyboardAvoidingView>
        ) : (
          content
        )}
      </SafeAreaView>
    );
  },
);

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
    gap: 16,
  },
});
