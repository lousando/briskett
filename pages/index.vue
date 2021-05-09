<template>
  <div>
    <h1 class="title">Brisket (beta)</h1>
    <h3 v-if="connectedAddress">
      Connected Address: {{this.connectedAddress}}
    </h3>
    <h3 v-if="connectedAddress">
      Balance: {{this.connectedAddressBalance}}ꜩ
    </h3>
    <button v-if="connectedAddress" @click="sendTezos" disabled>
      Send
    </button>
    <button v-if="connectedAddress" @click="receiveTezos" disabled>
      Receive
    </button>

    <button v-if="!connectedAddress" @click="getAddress" :disabled="isLoadingWallet">
      Connect Trezor
    </button>
  </div>
</template>

<script lang="js">
import Vue from 'vue'
import TrezorConnect from 'trezor-connect'

// only execute on browser
if (process.client) {
  TrezorConnect.init({
    connectSrc: process.NODE_ENV === "development" ? "https://localhost:8088/" : "",
    lazyLoad: false, // inject TrezorConnect iframe asap
    manifest: {
      email: process.env.NUXT_ENV_TREZOR_MANIFEST_EMAIL,
      appUrl: process.env.NUXT_ENV_TREZOR_MANIFEST_APP_URL,
    }
  });
}

export default Vue.extend({
  data () {
    return {
      isLoadingWallet: false,
      connectedAddress: "",
      connectedAddressBalance: "0.00"
    }
  },
  methods: {
    getAddress() {
      // prevent dead clicks
      this.isLoadingWallet = true;

      TrezorConnect.tezosGetAddress({
        // todo: find a way to let user select address
        path: "m/44'/1729'/0'",
      }).then(result => {
        if (result.success) {
          this.connectedAddress = result.payload.address;

          fetch(`https://api.tzstats.com/explorer/account/${this.connectedAddress}`)
            .then(r => r.json())
            .then(payload => {
              this.connectedAddressBalance = payload.total_balance;
          });

        } else {
          // re-enable button for user
          this.isLoadingWallet = false;
          // todo: prompt them to try again
        }
      });
    },
    async sendTezos () {
      // todo: implement
    },
    async receiveTezos () {
      // todo: implement
    }
  }
})
</script>

<style></style>
