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
          <v-card>
            <v-card-text class="pa-3 text-center">
              <v-img v-if="image_url"
                :aspect-ratio="1/1"
                style="padding: 10px; width: 100%; height: auto"
                :src="image_url"
              >
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="grey"
                      :size="60"
                    ></v-progress-circular>
                  </v-row>
                </template>
              </v-img>

              <div class="text-center mt-3">
                <v-btn color="success" large depressed rounded
                  :href="AlchemyAssetURL" target="_blank"
                >
                  View/Trade on OpenSea
                </v-btn>
              </div>

            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="7">

          <div class="pa-3">

            <div class="mb-3">
              <v-chip v-if="collectionName"
                :href="openseaCollectionURL" target="_blank"
                outlined class="mr-3"
              >
                {{ collectionName }}
              </v-chip>
            </div>

            <div class="text-h5 font-weight-bold mb-3">
              {{ info.name }}
            </div>

            <v-divider class="mb-3"></v-divider>

            <div class="mb-3">

            <v-btn v-if="isMyLikedToken" icon large
              v-on:click.prevent="removeLike"
              :loading="likeLoading"
              :disabled="likeLoading"
              class="mr-2"
            >
              <v-icon color="orange accent-4">mdi-heart</v-icon>
            </v-btn>
            <v-btn v-else icon large
              v-on:click.prevent="addLike"
              :loading="likeLoading"
              :disabled="likeLoading"
              class="mr-2"
            >
              <v-icon>mdi-heart-outline</v-icon>
            </v-btn>

              <strong class="mr-3">Owner:</strong>
              <UserSummary
                markself
                :address="null"
                :myaddress="myAddress"
                :frontdigits="4"
                :enddigits="4"
              ></UserSummary>
            </div>

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

                <UserActivityListOpenSea
              
                  hidenftinfo
                  :apiurl="apiURLForActivities"
                  class="text-body-2"
                >
                </UserActivityListOpenSea
              >

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
import NFTListAlchemy from "@/components/NFTListAlchemy"
import NFTCardAlchemy from "@/components/NFTCardAlchemy"
import UserActivityListOpenSea from "@/components/UserActivityListOpenSea"
import UserActivityOpenSea from "@/components/UserActivityOpenSea"
import Preloader from "@/components/Preloader"
import UserSummary from "@/components/UserSummary"
import {mapActions, mapGetters, mapState} from 'vuex'
// import { getCurrentNetworkID, getCurrentAccount } from '@/utils/utils'
import { config } from '@/config'

export default {
  components: {
    Preloader,
    NFTListAlchemy,
    NFTCardAlchemy,
    UserActivityListOpenSea
  ,
    UserActivityOpenSea,
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
    contractAddress: function() {
        if (this.$route.params.contractAddress) {
            return this.$route.params.contractAddress.toLowerCase()
        }
        else {
            return null
        }
    },
    contractName: function() {
      if (this.info.contractMetadata && this.info.contractMetadata.name) {
        return this.info.contractMetadata.name
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
    name: function () {
      return this.info.title
    },
    description: function () {
      if (this.info.description && this.info.description !== '' ) {
        return this.info.description
      }
      else if (this.info.contractMetadata && this.info.contractMetadata.openSea && this.info.contractMetadata.openSea.description) {
        return this.info.contractMetadata.openSea.description
      }
      else {
        return ''
      }
    },    
    image_url: function () {
      if (this.info.metadata && this.info.metadata.image_url) {
        return this.info.metadata.image_url
      }      
      else if (this.info.media && this.info.media[0]) {
        if (this.info.media[0].thumbnail) {
          return this.info.media[0].thumbnail
        }
        else if (this.info.media[0].raw) {
          return this.info.media[0].raw
        }
      }

      else if (this.info.contractMetadata && this.info.contractMetadata.openSea && this.info.contractMetadata.openSea.imageUrl) {
        return this.info.contractMetadata.openSea.imageUrl
      }
      else {
        return ''
      }
    },    
    collectionName: function() {
      if (this.info.contractMetadata && this.info.contractMetadata.openSea && this.info.contractMetadata.openSea.collectionName) {
        return this.info.contractMetadata.openSea.collectionName
      }
      else {
        return ''
      }
    },
    collectionSlug: function() {
      // if (this.info.collection && this.info.collection.slug) {
      //   return this.info.collection.slug
      // }
      // else {
      //   return null
      // }
      return null
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
      this.info = null
      this.NFTLoading = false
      this.NFTLoaded = false
      this.NFTLoadingError = null
      this.initializationDone = false
      this.likeLoading = false
      this.addLikedSuccess = false
      this.removeLikedSuccess = false
      await this.loadNetwork()
      await this.loadAccount()
      this.initializationDone = true

      this.loadNFTUsingAlchemy()

    },

    async loadNFTUsingAlchemy() {

      this.NFTLoading = true
      this.NFTLoaed = false
      this.NFTLoadingError = null

      const apiURL = config.AlchemyAPI[this.network.id].URLRoot + '/'
                + 'getNFTMetadata?contractAddress=' + this.contractAddress 
                + '&tokenId=' + this.tokenId + '&refreshCache=false'

      console.log(apiURL)

      try {
        const res = await this.$http.get(apiURL)
        console.log(res)
        this.info = res.body
      } catch (err) {
        console.log(err)
        this.NFTLoadingError = "Error: Cannot get NFT."
        // this.showNotification('error', 'Error occurred!')
      } finally {
        this.NFTLoading = false
        this.NFTLoaded = true
      }

    },

    async addLike () {
      this.likeLoading = true
      this.addLikedSuccess = false
      this.removeLikedSuccess = false

      const url = config.backendURL + '/api/' + this.network.id + '/nft-likes/add/'
          + this.myAddress.toLowerCase() + '/' + this.contractAddress.toLowerCase() + '/'
          + this.tokenId
      console.log(url)

      try {
        const res = await this.$http.post(url)
        console.log(res)
        this.addLikedSuccess = true
        const emitData = {
          type: 'added',
          contractAddress: this.contractAddress,
          token_id: this.token_id
        }
        this.$emit("token-like-change", emitData)
        this.loadAccount(true)
      } catch (err) {
        console.error(err)
      } finally {
        this.likeLoading = false
      }
    },

    async removeLike () {
      this.likeLoading = true
      this.addLikedSuccess = false
      this.removeLikedSuccess = false

      const url = config.backendURL + '/api/' + this.network.id + '/nft-likes/delete/'
          + this.myAddress.toLowerCase() + '/' + this.contractAddress.toLowerCase() + '/'
          + this.tokenId
      console.log(url)

      try {
        const res = await this.$http.post(url)
        console.log(res)
        this.removeLikedSuccess = true
        const emitData = {
          type: 'removed',
          contractAddress: this.contractAddress,
          token_id: this.token_id
        }
        this.$emit("token-like-change", emitData)
        this.loadAccount(true)
      } catch (err) {
        console.error(err)
      } finally {
        this.likeLoading = false
      }
    },


  },
  created () {
    this.init()
  },

}
</script>
