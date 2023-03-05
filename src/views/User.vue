<template>
  <div>

 <Preloader v-show="!initializationDone" text="loading..."></Preloader>

  <v-toolbar v-if="initializationDone" flat dark color="grey darken-2">
    <v-toolbar-title class="ml-3 mr-3">
      <v-icon class="mb-1" large color="grey lighten-1">mdi-account</v-icon>
      User
    </v-toolbar-title>

    <v-menu offset-y class="mr-3">
      <template v-slot:activator="{ on, attrs }">
        <v-btn small
          color="grey lighten-2"
          dark outlined
          v-bind="attrs"
          v-on="on"
        >
        Account Watchlist
        </v-btn>
      </template>
      <v-list>

        <v-list-item
          dense
          key="me"
        >
          <v-list-item-title class="text-center">
            <UserSummary
              markself
              :address="myAddress"
              :myaddress="myAddress"
              :frontdigits="4"
              :enddigits="4"
            ></UserSummary>
          </v-list-item-title>
        </v-list-item>

        <v-list-item
          dense
          v-for="(item, index) in account.followeeList"
          :key="index"
        >
          <v-list-item-title class="text-center">
            <UserSummary
              :address="item"
              :frontdigits="4"
              :enddigits="4"
            ></UserSummary>
          </v-list-item-title>
        </v-list-item>

      </v-list>
    </v-menu>

    <v-spacer></v-spacer>

    <UserSearch />

  </v-toolbar>



  <v-container v-if="initializationDone" fluid>

    <div class="px-5">

      <UserInfo
        :address="userAddress"
        :myaddress="myAddress"
        :networkid = "network.id"
        :myfollowers = "account.followerList"
        :myfollowees = "account.followeeList"
        :mynftlikelist = "account.nftLikeList"
        v-on:user-following-change="loadAccount(true)"
      />

      <v-tabs
        v-model="tab"
        background-color="transparent"
        color="black"
        grow
      >
        <v-tab key="tab1" class="grey lighten-4">
          NFTs
        </v-tab>
        <v-tab key="tab2" class="grey lighten-4">
          NFT ACTIVITIES
        </v-tab>
        <v-tab key="tab3" class="grey lighten-4">
          Tokens
        </v-tab>        
      </v-tabs>

      <v-tabs-items v-model="tab">

        <v-tab-item key="tab1" class="">

          <NFTListAlchemy v-if="initializationDone"
            title="NFTs"
            :useraddress="userAddress"
            list-type="byOwner"
            :api-root-url="apiRootURLAlchemy"
            :owner-address="userAddress"
            :apiurl="apiURL.NFTList"            
          >
          </NFTListAlchemy>

        </v-tab-item>


        <v-tab-item key="tab2">

          <UserActivityListNFTPort v-if="initializationDone"
            :useraddress="userAddress"
            :networkid="network.id"
          >
          </UserActivityListNFTPort>

        </v-tab-item>


        <v-tab-item key="tab3">

          <BalanceListMoralis v-if="initializationDone"
            :useraddress="userAddress"
          >
          </BalanceListMoralis>

        </v-tab-item>

      </v-tabs-items>

    </div>

  </v-container>

  </div>
</template>

<script>
import Moralis from 'moralis'
import BalanceListMoralis from "@/components/BalanceListMoralis"
import NFTListAlchemy from "@/components/NFTListAlchemy"
import NFTListNFTPort from "@/components/NFTListNFTPort"
import UserActivityListNFTPort from "@/components/UserActivityListNFTPort"
import UserActivityListMoralis from "@/components/UserActivityListMoralis"
import EventListOpenSea from "@/components/EventListOpenSea"
import Preloader from "@/components/Preloader"
import UserSummary from "@/components/UserSummary"
import UserInfo from "@/components/UserInfo"
import UserSearch from "@/components/UserSearch"
import {mapActions, mapGetters, mapState} from 'vuex'
// import { getCurrentNetworkID, getCurrentAccount } from '@/utils/utils'
import { config } from '@/config'

export default {
  components: {
    Preloader,
    BalanceListMoralis,
    NFTListNFTPort,
    NFTListAlchemy,
    UserActivityListNFTPort,
    UserActivityListMoralis,
    EventListOpenSea,
    UserSummary,
    UserInfo,
    UserSearch,
  },
  data: () => ({
    tab: null,
    loading: true,
    initializationDone: false,
    apiURL: {
      NFTList: null,
      activityList: null,
    },
    userAddress: null,
    thisIsMyself: false,
  }),
  computed: {
    ...mapGetters({
      // config: 'getConfig',
      network: 'getNetwork',
      account: 'getAccount',
      myAddress: 'getUserAccount',
    }),
  },
  methods: {
    ...mapActions(['loadNetwork', 'loadAccount']),
    async init() {
      console.log('user init...')
      this.initializationDone = false
      await this.loadNetwork()
      await this.loadAccount()
      console.log(this.account)
      console.log('my Address: ' + this.myAddress)

      if ('userAddress' in this.$route.params) {
        this.userAddress = this.$route.params.userAddress
        if (this.userAddress == this.myAddress) {
          this.thisIsMyself = true
        }
        else {
          this.thisIsMyself = false
        }
      }
      else {
        this.userAddress = this.myAddress
      }
      console.log('userAddress', this.userAddress)

      // const currentUser = Moralis.User.current()
      // console.log('currentUser', currentUser)
      // const accountFollowed = currentUser.get('accountFollowed')
      // // const accountFollowed = currentUser.get('accountFollowed')
      // currentUser.addUnique('accountFollowed', '0xa679c6154b8d4619af9f83f0bf9a13a680e01ecf')
      // await currentUser.save()
      // console.log('accountFollowed', currentUser.accountFollowed)


      this.initializationDone = true

      let chainName = 'ethereum'
      if (this.network.id == 137) {
        chainName = 'polygon'
      }

      this.apiRootURLAlchemy = config.AlchemyAPI[this.network.id].URLRoot
            
      this.apiURL.NFTList = config.NFTPortAPI.URLRoot
                + '/v0/accounts/' + this.userAddress
               + '?include=metadata&chain=' + chainName
                // + '&order_direction=desc'

      this.apiURL.activityList = config.NFTPortAPI.URLRoot + '/'
        + 'events?account_address=' + this.userAddress
        + '&event_type=successful'
        + '&only_opensea=false'

    },


  },
  created () {
    this.init()
  },

}
</script>
