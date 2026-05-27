import React, {
  createContext, memo, useCallback,
  useContext, useRef, useState,
} from 'react';
import {
  Animated, Modal, Platform,
  Pressable, StyleSheet, Text, View,
  Alert,
} from 'react-native';

import { colors } from '@/constants/colors';

interface ConfirmOptions {
  title:      string;
  message:    string;
  confirmText?: string;
  cancelText?:  string;
  destructive?: boolean;
  onConfirm:  () => void;
  onCancel?:  () => void;
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: () => {},
});

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = memo(({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [opts,    setOpts]    = useState<ConfirmOptions | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const show = useCallback((o: ConfirmOptions) => {
    // Mobile: usa Alert nativo (funciona perfeitamente)
    if (Platform.OS !== 'web') {
      Alert.alert(o.title, o.message, [
        { text: o.cancelText  ?? 'Cancelar', style: 'cancel',      onPress: o.onCancel },
        { text: o.confirmText ?? 'Confirmar', style: o.destructive ? 'destructive' : 'default', onPress: o.onConfirm },
      ]);
      return;
    }

    // Web: modal personalizado
    setOpts(o);
    setVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1, tension: 100, friction: 8, useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  function handleConfirm() {
    setVisible(false);
    opts?.onConfirm();
  }

  function handleCancel() {
    setVisible(false);
    opts?.onCancel?.();
  }

  return (
    <ConfirmContext.Provider value={{ confirm: show }}>
      {children}

      {/* Modal só é renderizado no web */}
      {Platform.OS === 'web' && (
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={handleCancel}
          statusBarTranslucent
        >
          <Pressable style={styles.overlay} onPress={handleCancel}>
            <Animated.View
              style={[styles.dialog, { transform: [{ scale: scaleAnim }] }]}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.title}>{opts?.title}</Text>
              {opts?.message ? (
                <Text style={styles.message}>{opts.message}</Text>
              ) : null}

              <View style={styles.btnRow}>
                <Pressable style={[styles.btn, styles.btnCancel]} onPress={handleCancel}>
                  <Text style={styles.btnCancelText}>
                    {opts?.cancelText ?? 'Cancelar'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, opts?.destructive ? styles.btnDanger : styles.btnConfirm]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.btnConfirmText}>
                    {opts?.confirmText ?? 'Confirmar'}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
});

ConfirmProvider.displayName = 'ConfirmProvider';

const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         24,
  },
  dialog: {
    width:           '100%',
    maxWidth:        400,
    backgroundColor: colors.surfaceElevated,
    borderRadius:    20,
    padding:         24,
    gap:             16,
    borderWidth:     1,
    borderColor:     colors.glassBorder,
  },
  title:   { color: colors.text,          fontSize: 20, fontWeight: '800' },
  message: { color: colors.textSecondary, fontSize: 15, lineHeight: 22 },
  btnRow:  { flexDirection: 'row', gap: 10 },
  btn:     { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnCancel:     { backgroundColor: colors.surfaceLight },
  btnConfirm:    { backgroundColor: colors.primary },
  btnDanger:     { backgroundColor: colors.danger },
  btnCancelText: { color: colors.text,       fontWeight: '700', fontSize: 15 },
  btnConfirmText:{ color: colors.background, fontWeight: '700', fontSize: 15 },
});