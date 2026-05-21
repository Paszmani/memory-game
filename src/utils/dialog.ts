import { Alert, Platform } from 'react-native';

type VoidOrPromise = void | Promise<void>;

type ConfirmActionParams = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => VoidOrPromise;
  onCancel?: () => VoidOrPromise;
};

function getDialogMessage(title: string, message?: string) {
  return message ? `${title}\n\n${message}` : title;
}

function runAction(action?: () => VoidOrPromise) {
  if (!action) return;

  void Promise.resolve(action()).catch((error) => {
    console.error('[dialog] Falha ao executar ação:', error);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert('Não foi possível executar a ação. Tente novamente.');
      return;
    }

    Alert.alert('Erro', 'Não foi possível executar a ação. Tente novamente.');
  });
}

export function showDialogMessage(title: string, message?: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(getDialogMessage(title, message));
    return;
  }

  Alert.alert(title, message);
}

export function confirmAction({
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmActionParams) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const confirmed = window.confirm(getDialogMessage(title, message));

    if (confirmed) {
      runAction(onConfirm);
    } else {
      runAction(onCancel);
    }

    return;
  }

  Alert.alert(title, message, [
    {
      text: cancelText,
      style: 'cancel',
      onPress: () => runAction(onCancel),
    },
    {
      text: confirmText,
      style: destructive ? 'destructive' : 'default',
      onPress: () => runAction(onConfirm),
    },
  ]);
}