<template>
  <div>

    <Preloader v-if="!loaded" text="loading..."></Preloader>

    <div v-if="loaded">

      <div v-if="loaded" class="text-subtitle-1 font-weight-bold text-center mt-4 mb-2">
        <span class="mx-1">
          Tokens: <span v-if="balanceList.length > 0">({{balanceList.length}})</span>
        </span>
      </div>
      <div class="text-center mb-4">(Powered by Moralis)</div>

      <v-simple-table v-if="loaded" class="mx-3 my-2">
        <template v-slot:default>
          <thead>
            <tr>
              <th></th>
              <th class="text-left">
                Symbol
              </th>
              <th class="text-left">
                Name
              </th>
              <th class="text-left">
                Balance
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in balanceList"
              :key="item.token_address"
            >
              <td>
                <v-img v-if="item.logo"
                  max-height="25"
                  max-width="25"
                  :src="item.logo"
                ></v-img>
              </td>
              <td><strong style="font-size: 1.1rem">{{ item.symbol }}</strong></td>
              <td>{{ item.name }}</td>
              <td>
                <AmountNumber :value="item.balanceDisplay"></AmountNumber>
              </td>
              <td>
                <v-btn icon small v-if="item.etherscanURL" :href="item.etherscanURL" target="_blank">
                <v-icon small>mdi-open-in-new</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>

    </div>

  </div>
</template>

<script>
import Preloader from "@/components/Preloader"
import AmountNumber from "@/components/AmountNumber"
import Moralis from 'moralis'
// import { getCurrentNetworkID, getCurrentAccount } from '@/utils/utils'
import {mapActions, mapGetters, mapState} from 'vuex'
import { config } from '@/config'

export default {
  props: ['useraddress'],
  data: () => ({
    loading: false,
    loaded: false,
    balanceList: [],
    LoadingError: null,
  }),
  components: {
    Preloader,
    AmountNumber,
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
      // this.loading = true
      await this.loadNetwork()
      await this.loadAccount()
      console.log('useraddress', this.useraddress)
      if (!this.useraddress) {
        this.useraddress = this.myAddress
      }
      this.getUserBalanceUsingMoralis()
    },

    async getUserBalanceUsingMoralis() {

      this.Loading = true
      this.loaded = false
      this.LoadingError = null

      this.balanceList = []

      try {

        const ETHBalance = await web3.eth.getBalance(this.useraddress)
        console.log('ETHBalance', ETHBalance)
        const ETHInfo = {
          balance: ETHBalance,
          balanceDisplay: Moralis.Units.FromWei(ETHBalance, 18),
          decimals: 18,
          name: 'Ether',
          symbol: 'ETH',
        }
        if (this.network.id == 137) {
          ETHInfo.name = 'MATIC'
          ETHInfo.symbol = 'MATIC'
        }
        this.balanceList.push(ETHInfo)

        // console.log('this network', this.network.id)
        const moralisNetworkSymbol = config.moralisNetworkSymbol[this.network.id]

        const options = { chain: moralisNetworkSymbol, address: this.useraddress };
        console.log(options)
        const balances = await Moralis.Web3API.account.getTokenBalances(options)
        console.log('moralis balances', balances)

        for (let i = 0; i < balances.length; i++) {
          const item = balances[i]
          if (item.name && item.decimals && item.token_address) {
            item.balanceDisplay = Moralis.Units.FromWei(item.balance, item.decimals)
            let useNetworkId = 1
            item.etherscanURL = config.network[useNetworkId].tokenURL + item.token_address.toLowerCase()
            this.balanceList.push(item)
          }
        }
        // console.log(this.balanceList)
      } catch (err) {
        console.log(err)
        this.LoadingError = "Error: Getting Balance List Failed."
        // this.showNotification('error', 'Error occurred!')
      } finally {
        this.Loading = false
        this.loaded = true
      }

    },

  },
  created () {
    this.init()
  },

}
</script>
