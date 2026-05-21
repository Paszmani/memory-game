import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id:      string;
  message: string;
  type:    ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_DURATION_MS = 2800;

const TYPE_COLORS: Record<ToastType, string> = {
  success: colors.success,
  error:   colors.danger,
  info:    colors.primary,
  warning: colors.warning,
};

const TYPE_ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✗',
  info:    'ℹ',
  warning: '⚠',
};

interface ToastItemProps {
  item:     ToastMessage;
  onRemove: (id: string) => void;
}

const ToastItem = memo(({ item, onRemove }: ToastItemProps) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(TOAST_DURATION_MS - 400),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onRemove(item.id));
  }, [item.id, opacity, onRemove]);

  return (
    <Animated.View style={[styles.toast, { opacity, borderColor: TYPE_COLORS[item.type] }]}>
      <Text style={[styles.toastIcon, { color: TYPE_COLORS[item.type] }]}>
        {TYPE_ICONS[item.type]}
      </Text>
      <Text style={styles.toastText}>{item.message}</Text>
    </Animated.View>
  );
});

ToastItem.displayName = 'ToastItem';

export const ToastProvider = memo(({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onRemove={remove} />
        ))}
      </View>
    </ToastContext.Provider>
  );
});

ToastProvider.displayName = 'ToastProvider';

const styles = StyleSheet.create({
  container: {
    position:   'absolute',
    top:        Platform.OS === 'ios' ? 54 : 16,
    left:       16,
    right:      16,
    gap:        8,
    zIndex:     9999,
  },
  toast: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius:    14,
    paddingVertical:  12,
    paddingHorizontal: 16,
    borderWidth:     1.5,
    gap:             10,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.25,
    shadowRadius:    8,
    elevation:       8,
  },
  toastIcon: { fontSize: 16, fontWeight: '700' },
  toastText: { color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
});