<template>
  <div>

    <Preloader v-show="!initialNFTLoaded" text="loading..."></Preloader>

    <div v-if="initialNFTLoaded">

      <div v-if="title" class="text-subtitle-1 font-weight-bold text-center mt-4 mb-2">
        {{ title }}
        <span v-if="allNFTLoaded" class="mx-1">
          ({{NFTList.length}})
        </span>
      </div>

      <div v-if="NFTList.length == 0"  class="text-center py-7">
        <div v-if="NFTLoadingError">
          <v-alert dense outlined type="error">{{ NFTLoadingError }}</v-alert>
        </div>
        <div v-else>
          No NFTs
        </div>
      </div>

      <v-layout wrap>
        <v-flex
          v-for="(item, i) in NFTList"
          :key="item.contract.address + ':' + item.id.tokenId"
          md3 sm4 xs12
        >

        <NFTCardAlchemy
          :info = "item"
          :key = "'nftcard' + i"
          :myaddress = "myAddress"
          :networkid = "network.id"
          :mynftlikelist = "account.nftLikeList"
          v-on:token-like-change="handleLikeChange"
        >
        </NFTCardAlchemy>

        </v-flex>
      </v-layout>

      <div v-if="!allNFTLoaded" class="my-4 text-center">
        <Preloader v-show="NFTLoading" text="loading..."></Preloader>
        <v-btn v-show="!NFTLoading" @click="getNFTListByOwner">
          Load More NFTs <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>

    </div>

  </div>
</template>

<script>
import NFTCardAlchemy from "@/components/NFTCardAlchemy"
import Preloader from "@/components/Preloader"
// import { getCurrentNetworkID, getCurrentAccount } from '@/utils/utils'
import {mapActions, mapGetters, mapState} from 'vuex'
import { config } from '@/config'

export default {
  props: {
    apiurl: { type: String },
    apiRootUrl: { type: String },
    batchsize: { type: Number, default: 50 },
    allownftremoval: { type: Boolean, default: false },
    title: { type: String, default: '' },
    listType: { type: String }, // 'byOwner', 'byContract', 'byTokenList'
    ownerAddress: { type: String, default: null },
    tokenList: { type: Array, default: null },
  },
  data: () => ({
    NFTLoading: false,
    initialNFTLoaded: false,
    numNFTLoaded: 0,
    allNFTLoaded: false,
    NFTList: [],
    NFTLoadingError: null,
  }),
  components: {
    Preloader,
    NFTCardAlchemy,
  },
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
      console.log('NFTListAlchemy init....')
      this.initialNFTLoaded = false
      this.allNFTLoaded = false
      this.numNFTLoaded = 0
      await this.loadNetwork()
      await this.loadAccount()
      if (this.listType == 'byOwner') {
        this.getNFTListByOwner()
      }
      else if (this.listType == 'byTokenList') {
        this.getNFTListByTokenList()
      }
    },

    async handleLikeChange(data) {
      if (this.allownftremoval) {
        if (data && data.type && data.type == 'removed') {
          // console.log('NEED To REMOVE')
          // console.log(data)
          this.removeNFTFromList(data.contractAddress, data.token_id)
        }
      }
      this.loadAccount(true)
    },

    removeNFTFromList (contractAddress, tokenId) {
      const newList = []
      for (const item of this.NFTList) {
        if (item.asset_contract.address.toLowerCase() != contractAddress ||
            item.token_id != tokenId) {
          newList.push(item)
        }
      }
      this.NFTList = newList
    },

    //------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------
    async getNFTListByOwner() {

      if (!this.ownerAddress) {
        // Error
      }

      this.NFTLoading = true

      const offset = this.numNFTLoaded
      const limit = this.batchsize

      this.NFTLoadingError = null
      this.allNFTLoaded = false

      if (this.numNFTLoaded == 0) {
        this.NFTList = []
        this.initialNFTLoaded = false
      }

      const apiURL = this.apiRootUrl + '/'
        + 'getNFTs/?owner=' + this.ownerAddress
        // + '&offset=' + offset
        // + '&limit=' + limit

      console.log('Calling Alchemy API: ', apiURL)

      try {
        const res = await this.$http.get(apiURL)
        console.log(res)
        this.initialNFTLoaded = true
        const items = res.body.ownedNfts
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          this.NFTList.push(item)
        }
        console.log(this.NFTList)
        this.numNFTLoaded += items.length
        if (items.length < limit) {
          this.allNFTLoaded = true
          this.$emit("all-nft-loaded", this.numNFTLoaded)
        }
        // console.log(this.NFTList)
      } catch (err) {
        console.log(err)
        this.NFTLoadingError = "Error: Getting NFT List Failed."
        this.initialNFTLoaded = true
        this.allNFTLoaded = true
        // this.showNotification('error', 'Error occurred!')
      } finally {
        this.NFTLoading = false
      }

    },

    //------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------
    async getNFTListByTokenList() {

      if (!this.tokenList) {
        // Error
      }
      console.log(this.tokenList)

      this.NFTLoading = true

      const offset = this.numNFTLoaded
      const limit = this.batchsize

      this.NFTLoadingError = null
      this.allNFTLoaded = false

      if (this.numNFTLoaded == 0) {
        this.NFTList = []
        this.initialNFTLoaded = false
      }

      const apiURL = this.apiRootUrl + '/' + 'getNFTMetadataBatch'
        // + '&offset=' + offset
        // + '&limit=' + limit

      const tokens = [];
      for (const item of this.tokenList) {
        let token = {
          contractAddress: item.contractAddress,
          tokenId: item.tokenId
        }
        tokens.push(token)
      }

      const data = {
        tokens: tokens,
        refreshCache: false
      }

      const headers = {
        'content-type': 'application/json',
        'accept': 'application/json'
      }

      console.log('Calling Alchemy API: ', apiURL)

      try {
        const res = await this.$http.post(apiURL, data)
        console.log(res)
        this.initialNFTLoaded = true
        const items = res.body
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          this.NFTList.push(item)
        }
        console.log(this.NFTList)
        this.numNFTLoaded += items.length
        if (items.length < limit) {
          this.allNFTLoaded = true
          this.$emit("all-nft-loaded", this.numNFTLoaded)
        }
        // console.log(this.NFTList)
      } catch (err) {
        console.log(err)
        this.NFTLoadingError = "Error: Getting NFT List Failed."
        this.initialNFTLoaded = true
        this.allNFTLoaded = true
        // this.showNotification('error', 'Error occurred!')
      } finally {
        this.NFTLoading = false
      }

    },

  },
  created () {
    this.init()
  },

}
</script>
