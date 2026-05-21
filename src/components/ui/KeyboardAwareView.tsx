import React, { memo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface Props {
  children:     React.ReactNode;
  style?:       ViewStyle;
  scrollable?:  boolean;
  extraHeight?: number;
}

/**
 * Wrapper que sobe o conteúdo quando o teclado aparece.
 * Funciona corretamente em iOS, Android e Web.
 */
export const KeyboardAwareView = memo(({
  children,
  style,
  scrollable   = true,
  extraHeight  = 20,
}: Props) => {
  const behavior = Platform.select({
    ios:     'padding' as const,
    android: 'height'  as const,
    default: undefined,
  });

  const inner = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingBottom: extraHeight }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="interactive"
    >
      {children}
    </ScrollView>
  ) : (
    <>{children}</>
  );

  if (Platform.OS === 'web') {
    // Na web o browser gerencia o scroll automaticamente
    return (
      <ScrollView
        style={[styles.flex, style]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: extraHeight }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={behavior}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {inner}
    </KeyboardAvoidingView>
  );
});

KeyboardAwareView.displayName = 'KeyboardAwareView';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    gap:      16,
    padding:  20,
  },
});