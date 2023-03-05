
<template>
<div>

  <!-- Loading -->
  <div v-if="!initializationDone">
    <Preloader />
  </div>

  <!-- initializationDone -->
  <div v-else>

      <!-- Wallet not available -->
      <div v-if="!walletAvailable">
        <v-card class="mx-auto" max-width="400">
          <v-card-text class="pa-7 text-center">
            <div class="text-center mb-4">
              <v-icon large color="error">mdi-alert-circle-outline</v-icon>
            </div>
            <div>
              Please Install MetaMask Plugin First.
            </div>
          </v-card-text>
        </v-card>
       </div>

      <!-- Wallet not connected -->
      <div v-if="walletAvailable && !walletConnected">
        <v-card class="mx-auto" max-width="400" :loading="loading" style="background: transparent;">
          <v-card-text class="pa-7 text-center">
            <div class="headline text-center mb-3">
              <span>Connect Wallet</span>
            </div>
            <v-btn large rounded color="primary"
              @click="connectWallet"
              :disabled="loading"
            >
              Connect Wallet
            </v-btn>
            <div v-show="error.connectWallet" class="login-error-section mt-2">
              {{ error.connectWallet }}
            </div>
          </v-card-text>

        </v-card>
       </div>

      <!-- Network Not Supported -->
      <div v-if="walletAvailable && walletConnected && !networkSupported">
        <v-card class="mx-auto" max-width="400">
          <v-card-text class="pa-7 text-center">
            <div class="text-center mb-4">
              <v-icon large color="error">mdi-alert-circle-outline</v-icon>
            </div>
            <div>
              Sorry, this network is Not Supported. Please use Mainet or Rinkeby.
            </div>
          </v-card-text>
        </v-card>
      </div>

       <!-- Login with wallet -->
       <div v-if="walletAvailable && walletConnected && networkSupported">

        <v-card class="mx-auto" max-width="400" :loading="loading">

          <v-card-text class="pa-7 text-center">
            <div class="headline text-center mb-3">Log in</div>
            <div class="mb-3">Please Sign Wallet</div>

            <v-btn large rounded color="primary"
              @click="logInBackend"
              :disabled="loading"
            >
              Login Using MetaMask
            </v-btn>
            <div v-show="error.login" class="login-error-section mt-2">
              {{ error.login }}
            </div>

          </v-card-text>
        </v-card>

      </div>

    </div><!-- v-else: geoBanned -->

  </div><!-- v-else: initializationDone -->

</div>
</template>

<script>
import { config } from '@/config'
import Preloader from "@/components/Preloader"
import {mapActions, mapGetters, mapState} from 'vuex'
export default {
  components: {
    Preloader,
  },
  data: () => ({
    config: config,
    initializationDone: false,
    networkSupported: false,
    loading: false,
    walletConnected: false,
    error: {
      connectWallet: null,
      login: null
    },
  }),
  computed: {
    ...mapGetters({
      network: 'getNetwork',
      myAddress: 'getUserAccount',
    }),
    walletAvailable: function () {
      return window.ethereum
    },
  },
  methods: {
    ...mapActions(['loadNetwork']),
    async init() {
      // console.log(window.ethereum)
      this.initializationDone = false
      this.walletConnected = this.isWalletConnected()
      this.networkSupported = this.isNetworkSupported()
      this.setupWalletListner()
      if (this.walletConnected && this.networkSupported) {
        await this.loadNetwork(true)
      }
      this.initializationDone = true
    },

    setupWalletListner () {
      if (window.ethereum) {
        window.ethereum.autoRefreshOnNetworkChange = false
        const that = this
        // window.ethereum.on('networkChanged', function (chainId) {
        //   console.log('Chain change detected.')
        //   that.init()
        // })
        window.ethereum.on('chainChanged', function (chainId) {
          console.log('Chain change detected.')
          that.logout()
        })
        window.ethereum.on('chainIdChanged', function (chainId) {
          console.log('Chain change detected.')
          that.logout()
        })
        window.ethereum.on('accountsChanged', function (accounts) {
          console.log('account change detected.')
          that.logout()
        })
      }
    },

    isWalletConnected() {
      return window.ethereum && window.ethereum.selectedAddress
    },

    isNetworkSupported() {
      if (this.isWalletConnected()) {
        const networkId = parseInt(window.ethereum.networkVersion)
        // console.log('networkid: ' + networkId)
        if (config.supportedNetworks[networkId]) {
          return true
        }
        else {
          return false
        }
      }
      else {
        return false
      }
    },

    async connectWallet() {
      try {
        this.loading = true
        this.error.connectWallet = null
        await window.ethereum.enable()
        this.walletConnected = this.isWalletConnected()
        this.networkSupported = this.isNetworkSupported()
        if (this.walletConnected & this.networkSupported) {
          await this.loadNetwork()
        }
        console.log(this.network)
        // console.log('defaultAccount', defaultAccount)

        this.loading = false
      } catch (error) {
        console.error(error)
        this.error.connectWallet = "Wallect Connection Error"
        this.loading = false
      }
    },

    async logInBackend () {
      this.loading = true
      this.error.login = null

      localStorage.removeItem(config.localStorageKey.login)

      await this.loadNetwork()
      // console.log(this.network)

      // console.log(config)
      const url = config.backendLogInURL
      const siginInMessage = config.backendLogInMessage
      // console.log('siginInMessage: ', siginInMessage)
      const myAddress = this.myAddress
      // console.log('myAddress', myAddress)
      // console.log('ethereum Address', window.web3.eth.defaultAccount )
      const networkId = this.network.id

      // Use wallet to get the signature
      let sig = null
      try {
        sig = await window.web3.eth.personal.sign(siginInMessage, myAddress)
        console.log(sig)
      } catch (err) {
        console.log(err)
        if (err.code && err.code === 4001) {
          this.error.login = "Access Denied"
        }
        else {
          this.error.login = "Login Error"
        }
        this.loading = false
        return
      }

      // Log in backend
      const loginData = {
        user: myAddress,
        sig: sig,
        networkid: networkId
      }

      try {
        const res = await this.$http.post(url, loginData)
        // console.log(res)
        const jwtToken = res.body.token
        // console.log(jwtToken)
        localStorage.setItem(config.localStorageKey.login, jwtToken)

        // console.log('Redirect: ' + config.defaultRedirect.appHome)

        if (this.$route.query && this.$route.query.redirect &&
          !this.$route.query.redirect.toLowerCase().includes('logout') &&
          !this.$route.query.redirect.toLowerCase().includes('login')) {
          const redirectPath = this.$route.query.redirect
          console.log('redirect: ' + redirectPath)
          this.$router.push({ path: redirectPath})
        }
        else {
          // console.log('redirect: ' + config.defaultRedirect.appHome)
          this.$router.push({ name: config.defaultRedirect.appHome })
        }
      } catch (err) {
        console.log(err)
        this.error.login = "login Error"
        return
      } finally {
        this.loading = false
      }
    },

    logout () {
      this.$store.state.myAddress = null
      localStorage.removeItem(config.localStorageKey.login)
      this.$router.push({ name: config.defaultRedirect.publicHome })
    },

  },
  created () {
    this.init()
  }
}
</script>

<style scoped>
.login-error-section {
  background-color: #FFCCBC;
  padding: 10px;
  font-size: 0.8rem;
  line-height: 1.2rem;
}
</style>
