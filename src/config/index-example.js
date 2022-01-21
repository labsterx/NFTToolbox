
export const config = {
  supportedNetworks: {
    1: 'Main Ethereum Network',
    // 3: 'Ropsten Testnet',
    // 42: 'Kovan Testnet',
    4: 'Rinkeby Test Network',
    137: 'Polygon',
  },
  localStorageKey: {
    login: 'moralisUser',
  },
  cacheTime: {
    network: 1 * 60 * 1000, // miliseconds
    account: 1 * 60 * 1000,
  },
  moralisNetworkSymbol: {
    1: 'eth',
    // 4: 'rinkeby',
    137: 'polygon',
  },
  moralisAPI: {
    serverURL: '[replace]',
    applicationID: '[replace]',
  },
  NFTPortNetworkName: {
    1: 'ethereum',
    // 4: 'rinkeby',
    137: 'polygon',
  },
  NFTPortAPI: {
    APIKey: '[replace]',
    URLRoot: 'https://api.nftport.xyz',
  },
  openseaAPI: {
    1: {
      URLRoot: 'https://api.opensea.io/api/v1'
    },
    4: {
      URLRoot: 'https://rinkeby-api.opensea.io/api/v1'
    },
    137: {
      URLRoot: 'https://api.opensea.io/api/v1'   // HACK!
    },
  },
  openseaAPIKey: '[replace]',
  openseaURL: {
    1: {
      assetPage: "https://opensea.io/assets/",
      collectionPage: "https://opensea.io/collection/",
      affiliateAddress: '[replace]',
    },
    137: {
      assetPage: "https://opensea.io/assets/matic/",
      collectionPage: "https://opensea.io/collection/",
      affiliateAddress: '[replace]',
    },
    4: {
      assetPage: "https://testnets.opensea.io/assets/",
      collectionPage: "https://testnets.opensea.io/collection/",
      affiliateAddress: '[replace]',
    }
  },
  defaultRedirect: {
    logout: 'logout',
    publicHome: 'public-home',
    appHome: 'app-home',
    WalletNotConnected: 'logout',
    chainChange: 'logout',
    accountChange: 'logout',
  },
  network: {
    1: {
      id: 1,
      name: 'Main Ethereum Network',
      rpc: 'https://mainnet.infura.io/v3/[replace]',
      // rpc: 'https://cloudflare-eth.com',
      txURL: 'https://etherscan.io/tx/',
      accountURL: 'https://etherscan.io/address/',
      tokenURL: 'https://etherscan.io/token/',
      etherscanApiURL: 'https://api.etherscan.io/',
    },
    4: {
      id: 4,
      name: 'Rinkeby Test Network',
      rpc: 'https://rinkeby.infura.io/v3/[replace]',
      txURL: 'https://rinkeby.etherscan.io/tx/',
      accountURL: 'https://rinkeby.etherscan.io/address/',
      tokenURL: 'https://rinkeby.etherscan.io/token/',
      etherscanApiURL: 'https://api-rinkeby.etherscan.io/',
    },
    137: {
      id: 137,
      name: 'Polygon',
      txURL: 'https://polygonscan.com/tx/',
      accountURL: 'https://polygonscan.com/address/',
      tokenURL: 'https://polygonscan.com/token/',
    },
  },
}
