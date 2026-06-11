import { Asset } from 'expo-asset';

function assetUri(assetModule: number): string {
  const asset = Asset.fromModule(assetModule);

  return asset.localUri ?? asset.uri;
}

export const DEFAULT_ASSETS = {
  background: assetUri(
    require('../../assets/default/background-memory-game.png'),
  ),

  logo: assetUri(require('../../assets/default/logo-compro-card.png')),

  cards: {
    alimentacaoAmor: assetUri(
      require('../../assets/default/card-alimentacao-amor.png'),
    ),

    compras: assetUri(require('../../assets/default/card-compras.png')),

    corporativo: assetUri(
      require('../../assets/default/card-corporativo.png'),
    ),

    premiacao: assetUri(require('../../assets/default/card-premiacao.png')),

    saude: assetUri(require('../../assets/default/card-saude.png')),

    combustivel: assetUri(
      require('../../assets/default/card-combustivel.png'),
    ),

    amizade: assetUri(require('../../assets/default/card-amizade.png')),

    paz: assetUri(require('../../assets/default/card-paz.png')),

    gratidao: assetUri(require('../../assets/default/card-gratidao.png')),

    presente: assetUri(require('../../assets/default/card-presente.png')),
  },
};