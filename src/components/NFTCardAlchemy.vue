<template>
  <div class="py-1 px-2">

  <v-card v-if="!loading"
    :to="{ name: 'nft', params: { contractAddress: contractAddress, tokenId: token_id } }"
    class="mx-auto my-2"
    max-width="344"
  >

    <v-card-title style="line-height: 1rem;">
      <div class="text-truncate text-body-2 font-weight-bold">
        <span v-if="collectionName">{{ collectionName }}</span>
        <span v-if="!collectionName">&nbsp;</span>
      </div>
    </v-card-title>

    <v-card-text :to="{ name: 'nft', params: { contractAddress: contractAddress, tokenId: token_id } }">
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

    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>

      <v-btn v-if="isMyLikedToken" icon
        v-on:click.prevent="removeLike"
        :loading="likeLoading"
        :disabled="likeLoading"
        class="mr-2"
      >
        <v-icon color="orange accent-4">mdi-heart</v-icon>
      </v-btn>
      <v-btn v-else icon
        v-on:click.prevent="addLike"
        :loading="likeLoading"
        :disabled="likeLoading"
        class="mr-2"
      >
        <v-icon>mdi-heart-outline</v-icon>
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

        </v-list>
      </v-menu>



    </v-card-actions>

  </v-card>


  </div>
</template>

<script>
import { config } from '@/config'
export default {
  props: ['info', 'myaddress', 'networkid', 'myhightlightlist', 'myhightlightlist', 'mynftlikelist'],
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
    }
  },
  computed: {
    // myAddress: function () {
    //   return this.$store.state.userAddress
    // },
    itemId: function () {
      return this.info.contract.address + ':' + this.info.id.tokenId
    },
    name: function () {
      return this.info.title
    },
    description: function () {
      if (this.info.description) {
        return this.info.description
      }
      else if (this.info.contractMetadata && this.info.contractMetadata.openSea && this.info.contractMetadata.openSea.description) {
        return this.info.contractMetadata.openSea.description
      }
      else {
        return ''
      }
    },
    contractName: function () {
      if (this.info.contractMetadata && this.info.contractMetadata.name) {
        return this.info.contractMetadata.name
      }
      else {
        return ''
      }
    },
    collectionName: function () {
      if (this.info.contractMetadata && this.info.contractMetadata.openSea && this.info.contractMetadata.openSea.collectionName) {
        return this.info.contractMetadata.openSea.collectionName
      }
      else {
        return ''
      }
    },    
    contractAddress: function () {
      return this.info.contract.address
    },
    token_id: function () {
      return this.info.id.tokenId
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
    token_url: function () {
      if (this.info.metadata && this.info.metadata.external_url) {
        this.info.metadata.external_url
      }
    },

    opensea_url: function () {
      const openseaRootURL = config.openseaURL[this.networkid].assetPage
      const openseaRef = config.openseaURL[this.networkid].affiliateAddress
      return openseaRootURL + this.info.token_address + '/' + this.info.token_id + '?ref=' + openseaRef

    },

    isMyToken: function () {
      // return false
      if (this.info.owner && this.info.owner.address) {
        if (this.info.owner.address.toLowerCase() == this.myaddress.toLowerCase()) {
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

      if (this.addHighlightSuccess) {
        return true
      }

      if (this.removeHighlightSuccess) {
        return false
      }

      for (let i=0; i<this.myhightlightlist.length; i++) {
        let hightlist = this.myhightlightlist[i]
        if (hightlist.contractAddress.toLowerCase() == this.contractAddress.toLowerCase() && hightlist.tokenId == this.token_id) {
          result = true
          break
        }
      }
      return result
    }
  },
  methods: {

    async init() {

      console.log(this.info)

    },

    async addLike () {
      this.likeLoading = true
      this.addLikedSuccess = false
      this.removeLikedSuccess = false

      const url = config.backendURL + '/api/' + this.networkid + '/nft-likes/add/'
          + this.myaddress.toLowerCase() + '/' + this.contractAddress.toLowerCase() + '/'
          + this.token_id
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

      const url = config.backendURL + '/api/' + this.networkid + '/nft-likes/delete/'
          + this.myaddress.toLowerCase() + '/' + this.contractAddress.toLowerCase() + '/'
          + this.token_id
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
      } catch (err) {
        console.error(err)
      } finally {
        this.likeLoading = false
      }
    },

    async addHighlight () {

      const url = config.backendURL + '/api/' + this.networkid + '/nft-hightlights/add/'
          + this.myaddress.toLowerCase() + '/' + this.contractAddress.toLowerCase() + '/'
          + this.token_id
      console.log(url)

      try {
        const res = await this.$http.post(url)
        console.log(res)
        this.addHighlightSuccess = true
        this.$emit("highlight-change")
      } catch (err) {
        console.error(err)
      } finally {
      }
    },

    async removeHighlight () {

      const url = config.backendURL + '/api/' + this.networkid + '/nft-hightlights/delete/'
          + this.myaddress.toLowerCase() + '/' + this.contractAddress.toLowerCase() + '/'
          + this.token_id
      console.log(url)

      try {
        const res = await this.$http.post(url)
        console.log(res)
        this.removeHighlightSuccess = true
        this.$emit("highlight-change")
      } catch (err) {
        console.error(err)
      } finally {
      }
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
