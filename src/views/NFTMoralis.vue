<template>
  <div>

 <Preloader v-show="!initializationDone" text="loading..."></Preloader>

  <v-toolbar v-if="initializationDone" flat dark color="grey darken-2">
    <v-toolbar-title>
      <v-icon class="mb-1" large color="orange lighten-1">mdi-account</v-icon>
      NFT
    </v-toolbar-title>

    <v-spacer></v-spacer>


  </v-toolbar>

  <v-container v-if="initializationDone" fluid>

    <Preloader v-show="NFTLoading" text="loading..."></Preloader>

    <div v-if="NFTLoadingError" class="text-center py-5">
       <v-alert dense outlined type="error">{{ NFTLoadingError }}</v-alert>
    </div>
    
    <div v-if="NFTLoaded && !NFTLoadingError" class="my-3 px-5">

      <v-row>

        <v-col cols="12" sm="5">

          <NFTCardMoralis
            :info = "info"
            :myaddress = "myAddress"
            :networkid = "network.id"
            :mynftlikelist = "account.nftLikeList"
            v-on:token-like-change="handleLikeChange"
          >
          </NFTCardMoralis>

          </v-card>
        </v-col>

        <v-col cols="12" sm="7">

          <div class="pa-3">

            <div class="mb-3">

              <v-chip v-if="contractType"
                outlined class="mr-3"
              >
                {{ contractType }}
              </v-chip>

              <v-chip v-if="contractName"
                outlined class="mr-3"
              >
                {{ contractName }}
              </v-chip>

            </div>

            <div class="text-h5 font-weight-bold mb-3">
              {{ name }}
            </div>

            <div v-if="ownerAddress" class="mb-3">

              Owner: <UserSummary
                markself
                :address="ownerAddress"
                :myaddress="myAddress"
                :frontdigits="4"
                :enddigits="4"
              ></UserSummary>

            </div>

           <div class="mb-3">

            <v-btn
              class="mr-2"
              :to="{ name: 'search-single-input', params: { searchType: 'img-url', searchInput: imageURL } }"
              target="_blank"
            >
              Find Similar NFTs
            </v-btn>

            <v-btn
              :to="{ name: 'search-two-input', params: { searchType: 'nft-counterfeit', searchInput: contractAddress, searchInputTwo: tokenId } }"
              target="_blank"
            >
              Find Counterfeit NFTs
            </v-btn>

            </div>

            <v-divider class="mb-3"></v-divider>

            <v-tabs
              v-model="tab"
              background-color="transparent"
              color="black"
              grow
            >
              <v-tab key="tab1" class="">
                Description
              </v-tab>
              <v-tab key="tab2" class="">
                Trading History
              </v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">

              <v-tab-item key="tab1" class="py-4 px-2 text-body-2">

                {{ description }}

              </v-tab-item>


              <v-tab-item key="tab2" class="py-4 px-2">

                <EventListOpenSea
                  :networkid="network.id"
                  :contractaddress="contractAddress"
                  :tokenid="tokenId"
                  hidenftinfo
                >
                </EventListOpenSea>

              </v-tab-item>

            </v-tabs-items>




          </div>

        </v-col>

      </v-row>
    </div>

  </v-container>

  </div>
</template>

<script>
import Moralis from 'moralis'
import NFTCardMoralis from "@/components/NFTCardMoralis"
import EventListOpenSea from "@/components/EventListOpenSea"
import Preloader from "@/components/Preloader"
import UserSummary from "@/components/UserSummary"
import NFTLowestPriceMoralis from "@/components/NFTLowestPriceMoralis"
import {mapActions, mapGetters, mapState} from 'vuex'
// import { getCurrentNetworkID, getCurrentAccount } from '@/utils/utils'
import { config } from '@/config'

export default {
  components: {
    Preloader,
    NFTCardMoralis,
    NFTLowestPriceMoralis,
    EventListOpenSea,
    UserSummary,
  },
  data: () => ({
    info: null,
    tab: null,
    NFTLoading: true,
    NFTLoaded: false,
    initializationDone: false,
    NFTLoadingError: null,
    likeLoading: false,
    addLikedSuccess: false,
    removeLikedSuccess: false,
  }),
  computed: {
    ...mapGetters({
      // config: 'getConfig',
      network: 'getNetwork',
      account: 'getAccount',
      myAddress: 'getUserAccount',
    }),
    name: function () {
      if (this.info.metadata && this.info.metadata.name) {
        return this.info.metadata.name
      }
      else if (this.info.name) {
        return this.info.name
      }
      else {
        return ''
      }
    },
    description: function () {
      if (this.info.metadata && this.info.metadata.description) {
        return this.info.metadata.description
      }
      else if (this.info.description) {
        return this.info.description
      }
    },
    imageURL: function() {
      if (this.info.metadata && this.info.metadata.image) {
        return this.fixImageURL(this.info.metadata.image)
      }
      else {
        return null
      }
    },
    ownerAddress: function() {
        if (this.info.owner_of) {
            return this.info.owner_of.toLowerCase()
        }
        else {
            return null
        }
    },
    contractAddress: function() {
        if (this.$route.params.contractAddress) {
            return this.$route.params.contractAddress.toLowerCase()
        }
        else {
            return null
        }
    },
    contractName: function() {
      if (this.name) {
        return this.info.name
      }
      else {
        return null
      }
    },
    contractType: function() {
      if (this.info.contract_type) {
        return this.info.contract_type
      }
      else {
        return ''
      }
    },
    tokenId: function() {
        if (this.$route.params.tokenId) {
            return this.$route.params.tokenId
        }
        else {
            return null
        }
    },
    collectionName: function() {
      // if (this.info.collection && this.info.collection.name) {
      //   return this.info.collection.name
      // }
      // else {
        return null
      // }
    },
    collectionSlug: function() {
      // if (this.info.collection && this.info.collection.slug) {
      //   return this.info.collection.slug
      // }
      // else {
        return null
      // }
    },    
    apiURLForActivities: function () {
      if (this.contractAddress && this.tokenId) {
        return config.openseaAPI[this.network.id].URLRoot + '/'
          + 'events?asset_contract_address=' + this.contractAddress
          + '&token_id=' + this.tokenId
          + '&event_type=successful'
          + '&only_opensea=false'
      }
      else {
        return null
      }
    },
    openseaAssetURL: function () {
      const openseaRootURL = config.openseaURL[this.network.id].assetPage
      const openseaRef = config.openseaURL[this.network.id].affiliateAddress
      return openseaRootURL + this.contractAddress + '/' + this.tokenId + '?ref=' + openseaRef
    },
    openseaCollectionURL: function () {
      const openseaRootURL = config.openseaURL[this.network.id].collectionPage
      const openseaRef = config.openseaURL[this.network.id].affiliateAddress
      return openseaRootURL + this.collectionSlug + '?ref=' + openseaRef

    },


    isMyLikedToken: function () {

      let result = false

      if (this.addLikedSuccess) {
        return true
      }

      if (this.removeLikedSuccess) {
        return false
      }

      for (let i=0; i<this.account.nftLikeList.length; i++) {
        let like = this.account.nftLikeList[i]
        if (like.contractAddress.toLowerCase() == this.contractAddress.toLowerCase() && like.tokenId == this.tokenId) {
          result = true
          break
        }
      }
      return result
    },
  },
  methods: {
    ...mapActions(['loadNetwork', 'loadAccount']),
    async init() {
      console.log('NFTNFTPort')
      this.info = null
      this.NFTLoading = false
      this.NFTLoaded = false
      this.NFTLoadingError = null
      this.initializationDone = false
      await this.loadNetwork()
      await this.loadAccount()
      this.initializationDone = true

      this.loadNFTUsingMoralis()

    },

    fixImageURL (imageURL) {
      let newURL = imageURL.replace("ipfs://ipfs/", "https://cloudflare-ipfs.com/ipfs/")
      newURL = newURL.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
      return newURL
    },

    async loadNFTUsingMoralis() {

      console.log('loadNFTUsingMoralis')
      this.NFTLoading = true
      this.NFTLoaed = false
      this.NFTLoadingError = null

      try {
        const moralisNetworkSymbol = config.moralisNetworkSymbol[this.network.id]

        const options = {
          chain: moralisNetworkSymbol,
          address: this.contractAddress,
          token_id: this.tokenId,
        }
        const res = await Moralis.Web3API.token.getTokenIdMetadata(options)
        if (res.metadata) {
          res.metadata = JSON.parse(res.metadata)
        }
        console.log('moralis NFT info', res)
        this.info = res
      } catch (err) {
        console.log(err)
        this.NFTLoadingError = "Error: Cannot get NFT."
        // this.showNotification('error', 'Error occurred!')
      } finally {
        this.NFTLoading = false
        this.NFTLoaded = true
      }

    },

    async handleLikeChange(data) {
      this.loadAccount(true)
    },

  },
  created () {
    this.init()
  },

}
</script>
