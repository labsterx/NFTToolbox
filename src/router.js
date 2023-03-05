import Vue from 'vue'
import Router from 'vue-router'
import { config } from '@/config'

import PublicLayout from '@/layouts/PublicLayout'
import AppLayout from '@/layouts/AppLayout'

import HomePublic from './views/HomePublic.vue'
import HomeApp from './views/HomeApp.vue'
import Watchlist from './views/Watchlist.vue'
import User from './views/User.vue'
import Search from './views/Search.vue'
import NFTNFTPort from './views/NFTNFTPort.vue'
import NFTAlchemy from './views/NFTAlchemy.vue'

// import Login from './views/Login.vue'
// import Register from './views/Register.vue'
import Logout from './views/Logout.vue'

Vue.use(Router)

const router = new Router({
  routes: [

    {
      path: '/',
      name: '',
      component: PublicLayout,

      children: [
        {
          path: '',
          name: 'public-home',
          component: HomePublic
        },
        // {
        //   path: 'login',
        //   name: 'login',
        //   component: Login
        // },
        // {
        //   path: 'register',
        //   name: 'register',
        //   component: Register
        // },
      ]

    },

    {
      path: '/app',
      name: 'App',
      component: AppLayout,
      children: [

        {
          path: '/',
          name: 'app-home',
          component: User
        },

        {
          path: 'user',
          name: 'user-default',
          component: User
        },

        {
          path: 'user/:userAddress',
          name: 'user',
          component: User
        },

        // {
        //   path: 'nft/:contractAddress/:tokenId',
        //   name: 'nft',
        //   component: NFT
        // },

        {
          path: 'nft/:contractAddress/:tokenId',
          name: 'nft',
          component: NFTAlchemy
        },

        {
          path: 'search',
          name: 'search',
          component: Search
        },

        {
          path: 'search/:searchType/:searchInput',
          name: 'search-single-input',
          component: Search
        },

        {
          path: 'search/:searchType/:searchInput/:searchInputTwo',
          name: 'search-two-input',
          component: Search
        },

        {
          path: 'watchlist',
          name: 'watchlist',
          component: Watchlist,
        },

        {
          path: 'logout',
          name: 'logout',
          component: Logout
        }
      ]
    }
  ]
})


router.beforeEach((to, from, next) => {
  if (to.path.includes('/app/')) {
    if (!localStorage.getItem(config.localStorageKey.login)) {
      // console.log('no jwtToken, redirecting to login')
      router.push({ name: 'public-home', query: { redirect: to.path }})
    }
  }
  next()
})

export default router
