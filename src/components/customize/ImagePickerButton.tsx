import React, { memo, useState } from 'react';

import { Alert } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import {
  pickAttractImage,
  pickBackgroundImage,
  pickCardBackImage,
  pickCardFrontImage,
  pickFinishIconImage,
  pickImageFromLibrary,
  pickLogoImage,
} from '@/services/imageService';

type ImagePickerMode =
  | 'generic'
  | 'card-front'
  | 'card-back'
  | 'background'
  | 'attract'
  | 'logo'
  | 'finish-icon';

interface Props {
  onImagePicked: (uri: string) => void;
  label?: string;
  mode?: ImagePickerMode;
}

async function pickByMode(mode: ImagePickerMode) {
  switch (mode) {
    case 'card-front':
      return pickCardFrontImage();

    case 'card-back':
      return pickCardBackImage();

    case 'background': {
      const result = await pickBackgroundImage();
      return result?.uri ?? null;
    }

    case 'attract':
      return pickAttractImage();

    case 'logo':
      return pickLogoImage();

    case 'finish-icon':
      return pickFinishIconImage();

    case 'generic':
    default:
      return pickImageFromLibrary({
        quality: 0.88,
        allowsEditing: false,
        persistOnWeb: true,
        storagePrefix: 'generic',
        maxWidth: 1400,
        maxHeight: 1400,
      });
  }
}

export const ImagePickerButton = memo(
  ({
    onImagePicked,
    label = 'Adicionar imagem',
    mode = 'generic',
  }: Props) => {
    const [isPicking, setIsPicking] = useState(false);

    async function handlePress() {
      if (isPicking) {
        return;
      }

      setIsPicking(true);

      try {
        const uri = await pickByMode(mode);

        if (!uri) {
          Alert.alert(
            'Imagem não selecionada',
            'Permita o acesso à galeria ou escolha uma imagem válida.',
          );
          return;
        }

        onImagePicked(uri);
      } catch (error) {
        Alert.alert(
          'Erro ao selecionar imagem',
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar a imagem.',
        );
      } finally {
        setIsPicking(false);
      }
    }

    return (
      <AppButton
        title={isPicking ? 'Selecionando...' : label}
        onPress={handlePress}
        variant="secondary"
        disabled={isPicking}
      />
    );
  },
);

ImagePickerButton.displayName = 'ImagePickerButton';