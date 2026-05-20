import React, { memo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  title?:    string;
  children:  React.ReactNode;
  style?:    ViewStyle;
}

export const SectionCard = memo(({ title, children, style }: Props) => (
  <View style={[styles.card, style]}>
    {title && <Text style={styles.title}>{title}</Text>}
    {children}
  </View>
));

SectionCard.displayName = 'SectionCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius:    22,
    padding:         18,
    gap:             14,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  title: {
    color:       colors.text,
    fontSize:    18,
    fontWeight:  '800',
    marginBottom: 2,
  },
});