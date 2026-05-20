import React, { memo, useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { pickImageFromLibrary } from '@/services/imageService';

interface Props {
  onImagePicked: (uri: string) => void;
  label?:        string;
}

export const ImagePickerButton = memo(({
  onImagePicked,
  label = 'Adicionar imagem',
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  async function handlePress() {
    setIsLoading(true);
    try {
      const uri = await pickImageFromLibrary();

      if (!uri) {
        Alert.alert(
          'Imagem não selecionada',
          'Permita o acesso à galeria e tente novamente.',
        );
        return;
      }

      onImagePicked(uri);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppButton
      title={isLoading ? 'Carregando...' : label}
      onPress={handlePress}
      variant="secondary"
      disabled={isLoading}
    />
  );
});

ImagePickerButton.displayName = 'ImagePickerButton';