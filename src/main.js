import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import VueResource from 'vue-resource'
import { config } from '@/config'
import Moralis from 'moralis'
import Web3 from 'web3'

Vue.use(VueResource)

Vue.http.interceptors.push(function(request) {
  // console.log(request.url)
  if (request.url.includes(config.backendAPIURL)) {
    // console.log('this is a backend API call')

    const localSavedJwtToken = localStorage.getItem(config.localStorageKey.login)
    if (localSavedJwtToken) {
      const code = 'Bearer ' + localSavedJwtToken
      request.headers.set('Authorization', code)
      // console.log('VueResource added jwtToken')
    }
    else {
      // console.log('VueResource: jwtToken not available')
    }

    // Handle responses
    return function(response) {
      if (response.status === 401 || response.status === 419
        || response.status === 440 ) {
        console.log('401/419/440 response received')
        localStorage.removeItem(config.localStorageKey.login)
        location.reload()
      }
    }

  }

})

Vue.config.productionTip = false

initNetwork().then(

  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
  }).$mount('#app')

)


async function initNetwork() {

  // get window.web3 ready
  if (window.ethereum) {
    console.log('create web3 from window.ethereum')
    window.web3 = new Web3(window.ethereum);
    // console.log(window.web3)
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    } catch (error) {
      console.log('user denied metamask access')
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    console.log('using old web3')
    window.web3 = new Web3(web3.currentProvider);
  }



}