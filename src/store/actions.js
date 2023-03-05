import { config } from '@/config'
import { getWeb3Accounts } from '@/utils/utils'
import Vue from 'vue'
import * as Web3 from 'web3'

// --------------------------------------------------------
function _getCurrentTime() {
  return (new Date()).getTime()
}

export default {

  // ---------------------------------------------------------------------
  // loadNetwork
  //----------------------------------------------------------------------
  async loadNetwork ({commit, state, dispatch}, noCache=false) {

    // console.log('Action: loadNetwork')

    const now = _getCurrentTime()
    if (!noCache && state.network.lastLoadTime && now - state.network.lastLoadTime <= config.cacheTime.network) {
      return
    }

   // get window.web3 ready
    if (window.ethereum) {
      console.log('create web3 from window.ethereum')
      window.web3 = new Web3(window.ethereum);
      console.log(window.web3)
      try {
        await ethereum.request({ method: 'eth_requestAccounts' })
      } catch (error) {
        console.log('user denied metamask access')
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      console.log('using old web3')
      window.web3 = new Web3(web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
      throw new Error('No Web3')
    }

    // console.log(window.web3)
    console.log('Using Web3 Version: ', window.web3.version)

    // Get Network Info
    const networkId = await window.web3.eth.net.getId()

    // Set provider
    // const rpcUrl = config.network[networkId].rpc
    // console.log('rpcURL', rpcUrl)
    // window.web3.setProvider(new Web3.providers.HttpProvider(rpcUrl));

    let networkName = null
    console.log('networkID: ', networkId)

    if (config.supportedNetworks[networkId]) {
      networkName = config.supportedNetworks[networkId]
    }
    else {
      throw new Error('Network not supported')
    }

    // Get User Account
    const accounts = await window.web3.eth.getAccounts()
    const myAccount = accounts[0].toLowerCase()

    const network = {
      lastLoadTime: now,
      id: networkId,
      name: networkName,
      userAccount: myAccount,
    }

    // getCurrentGasPrice(networkId)  // No need to wait

    commit('setNetwork', network)
    // console.log('Action: Done loadNetwork')

    window.ethereum.on('chainChanged', function (chainId) {
      console.log('Chain change detected.')
      localStorage.removeItem(config.localStorageKey.login)
      window.location.replace('/')
    })
    window.ethereum.on('chainIdChanged', function (chainId) {
      console.log('Chain change detected.')
      localStorage.removeItem(config.localStorageKey.login)
      window.location.replace('/')
    })
    window.ethereum.on('accountsChanged', function (accounts) {
      console.log('account change detected.')
      localStorage.removeItem(config.localStorageKey.login)
      window.location.replace('/')
    })

    return
  },


// ---------------------------------------------------------------------
  // loadAccount
  //----------------------------------------------------------------------
  async loadAccount ({commit, state, dispatch}, noCache=false) {

    console.log('Action: loadAccount')
    if (noCache) {
      console.log('loadAccount No Cache')
    }

    const now = _getCurrentTime()
    if (!noCache && state.account.lastLoadTime && now - state.account.lastLoadTime <= config.cacheTime.account) {
      // console.log('no need to reload account')
      return
    }

    if (!state.network.lastLoadTime) {
      await dispatch('loadNetwork')
    }
    if (!state.network.userAccount) {
      throw new Error ("Cannot get userAccount")
    }
    const myAddress = state.network.userAccount

    const account = {
      lastLoadTime: null,
      nftHighlightList: [],
      nftLikeList: [],
      followerList: [],
      followeeList: [],
    }

    // Get User Following Info
    let url = null
    let res = null
    try {
      url = `${config.backendAPIURL}/${state.network.id}/userfollow/${myAddress}`
      res = await Vue.http.get(url)
      if (res.body && res.body.followers) {
        // console.log('trackedTokens available on backend')
        account.followerList = res.body.followers
      }
      if (res.body && res.body.followees) {
        // console.log('trackedTokens available on backend')
        account.followeeList = res.body.followees
      }
    } catch (err) {
      console.log(err)
      throw new Error ("Cannot get User following info")
    }

    // Get nftHighlightList
    if (false) {
      try {
        url = `${config.backendAPIURL}/${state.network.id}/nft-hightlights/${myAddress}`
        res = await Vue.http.get(url)
        if (res.body) {
          // console.log('trackedTokens available on backend')
          account.nftHighlightList = res.body
        }
      } catch (err) {
        console.log(err)
        throw new Error ("Cannot get User NFT hightlights")
      }
    }

    // Get nftLikeList
    try {
      url = `${config.backendAPIURL}/${state.network.id}/nft-likes/user/${myAddress}`
      res = await Vue.http.get(url)
      if (res.body) {
        // console.log('trackedTokens available on backend')
        account.nftLikeList = res.body
      }
    } catch (err) {
      console.log(err)
      throw new Error ("Cannot get User nftLikeList")
    }

    account.lastLoadTime = now
    commit('setAccount', account)

  },

}

