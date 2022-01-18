<template>
  <div>

 <Preloader v-show="!initializationDone" text="loading..."></Preloader>

  <v-card v-if="initializationDone" flat class="mx-auto mt-6 mb-4" max-width="950">

    <h2 class="text-center mt-4">Search</h2>
    <div class="text-center mb-2">(Powered by NFTPort)</div>

    <v-row align="center" class="mx-3">

      <v-col cols="12" sm="12" md="8" v-if="searchType && searchType.val !== 'nft-counterfeit'">
        <v-text-field
          hide-details
          :label="searchType.hint"
          v-model.trim="searchInput"
          outlined
          dense
          single-line
          clearable
        ></v-text-field>
      </v-col>

      <v-col cols="12" sm="12" md="5" v-if="searchType && searchType.val == 'nft-counterfeit'">
        <v-text-field
          hide-details
          label="Contract Address"
          v-model.trim="searchContractAddress"
          outlined
          dense
          single-line
          clearable
        ></v-text-field>
      </v-col>

      <v-col cols="12" sm="12" md="3" v-if="searchType && searchType.val == 'nft-counterfeit'">
        <v-text-field
          hide-details
          label="Token Id"
          v-model.trim="searchTokenId"
          outlined
          dense
          single-line
          clearable
        ></v-text-field>
      </v-col>

      <v-col cols="12" sm="12" md="3">
        <v-select
          class='mt-6'
          v-model="searchType"
          :items="searchTypeOptions"
          item-text="display"
          item-value="val"
          label=""
          dense
          solo
          return-object
        ></v-select>
      </v-col>

      <v-col cols="12" sm="12" md="1">
        <v-btn>
          <v-icon dark @click="doSearch()">mdi-magnify</v-icon>
        </v-btn>
      </v-col>

    </v-row>

  </v-card>


  <v-container v-if="initializationDone" fluid>

     <Preloader v-show="searchLoading" text="loading..."></Preloader>

    <div v-if="initialResultsLoaded">

      <div v-if="resultNFTList.length == 0"  class="text-center py-7">
        <div v-if="searchLoadingError">
          <v-alert dense outlined type="error">{{ searchLoadingError }}</v-alert>
        </div>
        <div v-else>
          No Results
        </div>
      </div>

      <v-layout wrap>
        <v-flex
          v-for="(item, i) in resultNFTList"
          :key="item.contract_address + ':' + item.token_id + ':' + i"
          md3 sm4 xs12
        >

        <NFTCardNFTPort
          :info = "item"
          :key = "'nftcard' + i"
          :myaddress = "myAddress"
          :networkid = "network.id"
          :mynftlikelist = "account.nftLikeList"
          v-on:token-like-change="handleLikeChange"
          linktarget="_blank"
        >
        </NFTCardNFTPort>

        </v-flex>
      </v-layout>

      <div class="my-4 text-center" v-show="initialResultsLoaded && resultNFTList.length>0">
        <Preloader v-show="searchLoading" text="loading..."></Preloader>
        <v-btn v-show="!searchLoading" @click="doSearch(true)">
          Load More<v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>

    </div>

  </v-container>

  </div>
</template>

<script>
import Moralis from 'moralis'
import Preloader from "@/components/Preloader"
import UserSearch from "@/components/UserSearch"
import NFTCardNFTPort from "@/components/NFTCardNFTPort"
import {mapActions, mapGetters, mapState} from 'vuex'
// import { getCurrentNetworkID, getCurrentAccount } from '@/utils/utils'
import { config } from '@/config'

export default {
  components: {
    Preloader,
    UserSearch,
    NFTCardNFTPort,
  },
  data: () => ({
    loading: true,
    searchLoading: false,
    initializationDone: false,
    searchInput: null,
    searchContractAddress: null,
    searchTokenId: null,
    initialResultsLoaded: false,
    searchLoadingError: null,
    resultNFTList: [],
    limit: 50,
    pageLoaded: 0,
    searchType: { display: 'NFT Text Search', val: 'nft-text', hint: 'Enter Text related to an NFT' },
    searchTypeOptions: [
      { display: 'NFT Text Search', val: 'nft-text', hint: 'Enter Text related to an NFT' },
      { display: 'Image Search By URL', val: 'img-url', hint: 'Enter Image URL'  },
      { display: 'NFT Counterfeit Detection', val: 'nft-counterfeit', hint: 'Enter NFT info'  },
      { display: 'User Account', val: 'user-account', hint: 'Enter account address'  },
    ],
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
      this.initializationDone = true

      if (this.$route.params.searchType && this.$route.params.searchInput) {

        for (let i = 0; i < this.searchTypeOptions.length; i++) {
          const opt = this.searchTypeOptions[i]
          if (opt.val == this.$route.params.searchType) {
            this.searchType = opt
          }
        }

        if (this.$route.params.searchInputTwo) {
          this.searchContractAddress = this.$route.params.searchInput
          this.searchTokenId = this.$route.params.searchInputTwo
        }
        else {
          this.searchInput = this.$route.params.searchInput
        }

        this.doSearch()

      }

    },

    async handleLikeChange(data) {
      this.loadAccount(true)
    },

    async doSearch(searchContinue=false) {

      if (!searchContinue) {
        this.initialResultsLoaded = false
        this.resultNFTList = []
        this.pageLoaded = 0
      }

      console.log('doSearch: ', this.searchType.val)
      console.log('searchContinue', searchContinue)
      // console.log( '|' + this.searchInput + '|')

      if (this.searchType.val == 'user-account') {
        if (this.searchInput) {
          const cleanAddress = this.searchInput.toLowerCase()
          this.$router.push({ name: 'user', params: {userAddress: cleanAddress} })
        }
      }

      else if (this.searchType.val == 'nft-text') {
        if (this.searchInput) {
          this.doNFTSearchUsingNFTPort()
        }
      }

      else if (this.searchType.val == 'img-url') {
        if (this.searchInput) {
          this.doImageURLSearchUsingNFTPort()
        }
      }

      else if (this.searchType.val == 'nft-counterfeit') {
        if (this.searchContractAddress && this.searchTokenId) {
          this.doNFTCounterfeitSearchUsingNFTPort()
        }
        else {
          console.log('Missing input for nft-counterfeit')
        }
      }

    },

    async doNFTSearchUsingNFTPort() {

      this.searchLoading = true

      const pageNumber = this.pageLoaded + 1
      const pageSize = this.limit

      let chainName = 'ethereum'
      if (this.network.id == 137) {
        chainName = 'polygon'
      }
      let apiURL = config.NFTPortAPI.URLRoot
        + '/v0/search?text=' + this.searchInput
        + '&chain=' + chainName
        + '&page_number=' + pageNumber
        + '&page_size=' + pageSize

      console.log(apiURL)

     try {
        const res = await this.$http.get(apiURL, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': config.NFTPortAPI.APIKey
          }
        })
        console.log(res)
        this.initialResultsLoaded = true
        this.pageLoaded++
        if (res.body.response == 'OK') {
          const items = res.body.search_results
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            this.resultNFTList.push(item)
          }
          console.log(this.resultNFTList)
        }
      } catch (err) {
        console.log(err)
        this.searchLoadingError = "Eror getting results."
        // this.showNotification('error', 'Error occurred!')
      } finally {
        this.searchLoading = false
      }

    },


    async doImageURLSearchUsingNFTPort() {

      this.searchLoading = true

      const pageNumber = this.pageLoaded + 1
      const pageSize = this.limit

      // console.log('networkid', this.network.id)
      const chainName = config.NFTPortNetworkName[this.network.id]

      let apiURL = config.NFTPortAPI.URLRoot
        + '/v0/recommendations/similar_nfts/urls'

      const postData = {
        chain: chainName,
        url: this.searchInput,
        page_number: pageNumber,
        page_size: pageSize,
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': config.NFTPortAPI.APIKey
      }

     try {

        const res = await this.$http.post(apiURL, postData, {headers})
        console.log(res)
        this.initialResultsLoaded = true
        this.pageLoaded++
        const items = res.body.nfts
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (item.chain && item.chain !== chainName) {
            continue
          }
          this.resultNFTList.push(item)
        }
        console.log(this.resultNFTList)
      } catch (err) {
        console.log(err)
        this.searchLoadingError = "Eror getting results."
        // this.showNotification('error', 'Error occurred!')
      } finally {
        this.searchLoading = false
      }


    },

    async doNFTCounterfeitSearchUsingNFTPort() {

      this.searchLoading = true

      const pageNumber = this.pageLoaded + 1
      const pageSize = this.limit

      console.log('networkid', this.network.id)
      const chainName = config.NFTPortNetworkName[this.network.id]

      let apiURL = config.NFTPortAPI.URLRoot
        + '/v0/duplicates/tokens'

      const postData = {
        chain: chainName,
        contract_address: this.searchContractAddress,
        token_id: this.searchTokenId,
        page_number: pageNumber,
        page_size: pageSize,
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': config.NFTPortAPI.APIKey
      }

     try {

        const res = await this.$http.post(apiURL, postData, {headers})
        console.log(res)
        this.initialResultsLoaded = true
        this.pageLoaded++
        const items = res.body.similar_nfts
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          // if (item.chain && item.chain !== chainName) {
          //   continue
          // }
          this.resultNFTList.push(item)
        }
        console.log(this.resultNFTList)
      } catch (err) {
        console.log(err)
        this.searchLoadingError = "Eror getting results."
        // this.showNotification('error', 'Error occurred!')
      } finally {
        this.searchLoading = false
      }


    }


  },
  created () {
    this.init()
  },

}
</script>
