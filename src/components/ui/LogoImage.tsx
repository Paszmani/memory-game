import React, { memo, useState } from 'react';

import { Image } from 'expo-image';

interface Props {
  uri: string;
  /** Altura fixa (âncora visual). A largura sai da proporção da imagem. */
  height: number;
  /** Teto de largura — impede que uma logo muito larga empurre/estoure o layout. */
  maxWidth: number;
  /** Piso de largura, para logos muito estreitas não sumirem. */
  minWidth?: number;
  borderRadius?: number;
}

/**
 * Logo que aceita QUALQUER proporção sem quebrar o layout: mantém a altura
 * fixa e deriva a largura da razão natural da imagem (lida no onLoad),
 * limitada entre minWidth e maxWidth. `contentFit="contain"` evita corte
 * (o antigo "cover" recortava logos não-quadradas num quadrado) e distorção.
 *
 * Antes do onLoad a largura cai no teto (maxWidth) para reservar o espaço e
 * evitar salto de layout quando a proporção chega.
 */
export const LogoImage = memo(
  ({ uri, height, maxWidth, minWidth = 24, borderRadius = 0 }: Props) => {
    const [aspect, setAspect] = useState<number | null>(null);

    const width =
      aspect === null
        ? maxWidth
        : Math.min(maxWidth, Math.max(minWidth, height * aspect));

    return (
      <Image
        source={{ uri }}
        style={{ width, height, borderRadius }}
        contentFit="contain"
        transition={160}
        cachePolicy="memory-disk"
        onLoad={(event) => {
          const w = event.source?.width;
          const h = event.source?.height;

          if (w && h) {
            setAspect(w / h);
          }
        }}
      />
    );
  },
);

LogoImage.displayName = 'LogoImage';
