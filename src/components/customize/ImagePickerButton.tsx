import { Alert } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { pickImageFromLibrary } from '@/services/imageService';

type ImagePickerButtonProps = {
  onImagePicked: (uri: string) => void;
};

export function ImagePickerButton({ onImagePicked }: ImagePickerButtonProps) {
  async function handlePress() {
    const uri = await pickImageFromLibrary();

    if (!uri) {
      Alert.alert(
        'Imagem não selecionada',
        'Permita o acesso à galeria ou escolha uma imagem válida.',
      );
      return;
    }

    onImagePicked(uri);
  }

  return <AppButton title="Adicionar imagem" onPress={handlePress} />;
}