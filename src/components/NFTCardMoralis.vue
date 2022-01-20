<template>
  <div class="py-1 px-2">

  <v-card v-if="!loading"
    :to="{ name: 'nft', params: { contractAddress: contractAddress, tokenId: token_id } }"
    class="mx-auto my-2"
    :target="linktarget"
    max-width="344"
  >

    <v-card-title style="line-height: 1rem;">
      <div class="text-truncate text-body-2 font-weight-bold">
        <span v-if="collectionName">{{ collectionName }}</span>
        <span v-if="!collectionName">&nbsp;</span>
      </div>
    </v-card-title>

    <v-card-text
      :to="{ name: 'nft', params: { contractAddress: contractAddress, tokenId: token_id } }"
      :target="linktarget"
    >
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
      <v-img v-if="!image_url"
        :aspect-ratio="1/1"
        style="padding: 10px; width: 100%; height: auto; opacity: 0.15;"
        src="/images/default-pic.png"
      >
      </v-img>
    </v-card-text>

    <v-card-text class="py-0">
      <div v-if="name" class="d-inline-block text-truncate" style="max-width: 100%">{{ name }}</div>
      <div v-if="showDescription" class="d-inline-block text-truncate"  style="max-width: 100%">{{ description }}&nbsp;</div>

    <div v-if="isMyToken && showSendNFTForm"
      class="grey lighten-4 pa-2"
      v-on:click.prevent
    >
      <div class="mb-2">
        <v-text-field
          hide-details
          label="Recipient's Account"
          v-model.trim="sendToAccountAddress"
          outlined
          dense
          small
          clearable
          required
        ></v-text-field>
      </div>
      <div class="mx-2 text-center">
        <v-btn secondary small class="mr-1" @click="sendNFT">Transfer</v-btn>
        <v-btn secondary outlined small class="ml-1" @click="toggleTransferNFTForm">Hide</v-btn>
      </div>
    </div>

    </v-card-text>


    <v-card-actions>
      <v-spacer></v-spacer>

      <v-btn v-if="isMyLikedToken" icon
        v-on:click.prevent="removeLike"
        :loading="likeLoading"
        :disabled="likeLoading"
        class="mr-2"
      >
        <v-icon color="orange accent-4">mdi-eye</v-icon>
      </v-btn>
      <v-btn v-else icon
        v-on:click.prevent="addLike"
        :loading="likeLoading"
        :disabled="likeLoading"
        class="mr-2"
      >
        <v-icon>mdi-eye-outline</v-icon>
      </v-btn>

      <v-btn icon 
        :disabled="!token_url" 
        v-on:click.stop=""
        :href="token_url" target="_blank" 
        class="mr-2"
        >
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>

      <v-menu
        bottom
        left
      >

        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
            v-on:click.prevent=""
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>

          <v-list-item>
            <v-list-item-title>
              <v-btn text :href="opensea_url" target="_blank">View/Trade on OpenSea</v-btn>
            </v-list-item-title>
          </v-list-item>

          <v-list-item v-if="isMyToken">
            <v-list-item-title>
              <v-btn text @click="toggleTransferNFTForm">Transfer This NFT</v-btn>
            </v-list-item-title>
          </v-list-item>

        </v-list>
      </v-menu>

    </v-card-actions>



  </v-card>


  </div>
</template>

<script>
import Moralis from 'moralis'
import { config } from '@/config'
export default {
  props: {
    info: { type: Object },
    myaddress: { type: String },
    networkid: { type: Number },
    mynftlikelist: { type: Array },
    linktarget: { type: String, default: '_self' },
  },
  data () {
    return {
      loading: false,
      likeLoading: false,
      requestModalOpen: false,
      showDescription: false,
      addLikedSuccess: false,
      removeLikedSuccess: false,
      addHighlightSuccess: false,
      removeHighlightSuccess: false,
      showSendNFTForm: false,
      sendToAccountAddress: null,
    }
  },
  computed: {
    // myAddress: function () {
    //   return this.$store.state.userAddress
    // },
    itemId: function () {
      return this.info.token_address + ':' + this.info.token_id
    },
    // metaData: function () {
    //   if (this.info.metadata) {
    //     return JSON.parse(this.info.metadata)
    //   }
    //   else {
    //     return {}
    //   }
    // },
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
      else {
        return ''
      }
    },
    contractName: function () {
      return this.info.name
    },
    collectionName: function () {
      return ''
    },    
    contractAddress: function () {
      return this.info.token_address
    },
    contractType: function () {
      if (this.info.contract_type) {
        return this.info.contract_type
      }
      else {
        return null
      }
    },
    token_id: function () {
      return this.info.token_id
    },
    ownerAddress: function () {
      return this.info.owner_of
    },
    image_url: function () {
      if (this.info.image_preview_url) {
        return this.fixImageURL(this.info.image_preview_url)
      }
      else if (this.info.image_url) {
        return this.fixImageURL(this.info.image_url)
      }
      else if (this.info.metadata && this.info.metadata.image) {
        return this.fixImageURL(this.info.metadata.image)
      }
      else if (this.info.asset_contract && this.info.asset_contract.image_url) {
        return this.fixImageURL(this.info.asset_contract.image_url)
      }
      else if (this.info.metadata && this.info.metadata.image_preview_url) {
        return this.fixImageURL(this.info.metadata.image_preview_url)
      }       
      else if (this.info.metadata && this.info.metadata.image_url) {
        return this.fixImageURL(this.info.metadata.image_url)
      }             
      else {
        return ''
      }
    },
    token_url: function () {
      return this.info.token_uri
    },
    opensea_url: function () {
      const openseaRootURL = config.openseaURL[this.networkid].assetPage
      const openseaRef = config.openseaURL[this.networkid].affiliateAddress
      return openseaRootURL + this.info.token_address + '/' + this.info.token_id + '?ref=' + openseaRef

    },
    isMyToken: function () {
      // return false
      if (this.info.owner_of) {
        if (this.info.owner_of.toLowerCase() == this.myaddress.toLowerCase()) {
          return true
        }
      }
      else {
        return false
      }
    },
    isMyLikedToken: function () {
      // return false
      let result = false

      if (this.addLikedSuccess) {
        return true
      }

      if (this.removeLikedSuccess) {
        return false
      }

      for (let i=0; i<this.mynftlikelist.length; i++) {
        let like = this.mynftlikelist[i]
        if (like.contractAddress.toLowerCase() == this.contractAddress.toLowerCase() && like.tokenId == this.token_id) {
          result = true
          break
        }
      }
      return result
    },
    isMyHighlight: function () {
      // return false
      let result = false
      // if (!this.isMyToken) {
      //   return false
      // }

      // if (this.addHighlightSuccess) {
      //   return true
      // }

      // if (this.removeHighlightSuccess) {
      //   return false
      // }

      // for (let i=0; i<this.myhightlightlist.length; i++) {
      //   let hightlist = this.myhightlightlist[i]
      //   if (hightlist.contractAddress.toLowerCase() == this.contractAddress.toLowerCase() && hightlist.tokenId == this.token_id) {
      //     result = true
      //     break
      //   }
      // }
      return result
    }
  },
  methods: {

    async init() {

      // console.log('NFTCardMoralis', this.info)

    },

    fixImageURL (imageURL) {
      let newURL = imageURL.replace("ipfs://ipfs/", "https://cloudflare-ipfs.com/ipfs/")
      newURL = newURL.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
      return newURL
    },

    async addLike () {
      console.log('addLike')

      this.likeLoading = true
      this.addLikedSuccess = false
      this.removeLikedSuccess = false

      try {
        let columnName = 'nftFollowed'
        if (this.networkid == 137) {
          columnName = 'nftFollowedPolygon'
        }
        const currentUser = Moralis.User.current()
        const data = {
          contractAddress: this.contractAddress,
          tokenId: this.token_id
        }
        currentUser.addUnique(columnName, data)
        await currentUser.save()
        this.addLikedSuccess = true
        const emitData = {
          type: 'added',
          contractAddress: this.contractAddress,
          token_id: this.token_id
        }
        this.$emit("token-like-change", emitData)
      } catch (err) {
        console.error(err)
      } finally {
        this.likeLoading = false
      }
    },

    async removeLike () {
      console.log('removeLike')

      this.likeLoading = true
      this.addLikedSuccess = false
      this.removeLikedSuccess = false

      try {
        let columnName = 'nftFollowed'
        if (this.networkid == 137) {
          columnName = 'nftFollowedPolygon'
        }
        const currentUser = Moralis.User.current()
        const data = {
          contractAddress: this.contractAddress,
          tokenId: this.token_id
        }
        currentUser.remove(columnName, data)
        await currentUser.save()
        this.removeLikedSuccess = true
        const emitData = {
          type: 'removed',
          contractAddress: this.contractAddress,
          token_id: this.token_id
        }
        this.$emit("token-like-change", emitData)
      } catch (err) {
        console.error(err)
      } finally {
        this.likeLoading = false
      }
    },

    async sendNFT (evt) {
      evt.preventDefault()
      if (!this.isMyToken || !this.sendToAccountAddress || !this.contractType) {
        return
      }
      const options = {
        type: this.contractType.toLowerCase(),
        receiver: this.sendToAccountAddress.toLowerCase(),
        contractAddress: this.contractAddress,
        tokenId: this.token_id,
      }

      try {
        let transaction = await Moralis.transfer(options)
        console.log(transaction)
      } catch (err) {
        console.log(err)
      }
    },

    toggleTransferNFTForm (evt) {
      evt.preventDefault()
      this.showSendNFTForm = !this.showSendNFTForm
    },

    async addHighlight () {

      // const url = config.backendURL + '/api/' + this.networkid + '/nft-hightlights/add/'
      //     + this.myaddress.toLowerCase() + '/' + this.contractAddress.toLowerCase() + '/'
      //     + this.token_id
      // console.log(url)

      // try {
      //   const res = await this.$http.post(url)
      //   console.log(res)
      //   this.addHighlightSuccess = true
      //   this.$emit("highlight-change")
      // } catch (err) {
      //   console.error(err)
      // } finally {
      // }
    },

    async removeHighlight () {

      // const url = config.backendURL + '/api/' + this.networkid + '/nft-hightlights/delete/'
      //     + this.myaddress.toLowerCase() + '/' + this.contractAddress.toLowerCase() + '/'
      //     + this.token_id
      // console.log(url)

      // try {
      //   const res = await this.$http.post(url)
      //   console.log(res)
      //   this.removeHighlightSuccess = true
      //   this.$emit("highlight-change")
      // } catch (err) {
      //   console.error(err)
      // } finally {
      // }
    },

  },
  created () {
    this.init()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
