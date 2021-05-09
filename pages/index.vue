<template>
	<div>
		<h1 class="is-size-1">Brisket (beta)</h1>

		<h4 v-if="connectedAddress" class="is-size-4">
			Connected Address: {{ this.connectedAddress }}
		</h4>
		<h4 v-if="connectedAddress" class="is-size-4">
			Balance: {{ this.connectedAddressBalance }}ꜩ
		</h4>
		<div class="is-flex is-justify-content-space-around">
			<button
				v-if="connectedAddress"
				class="button"
				disabled
				@click="sendTezos"
			>
				Send
			</button>
			<button
				v-if="connectedAddress"
				class="button"
				disabled
				@click="delegateTezos"
			>
				Delegate
			</button>
			<button
				v-if="connectedAddress"
				class="button"
				disabled
				@click="receiveTezos"
			>
				Receive
			</button>
		</div>

		<button
			v-if="!connectedAddress"
			:class="{
				button: true,
				'is-large': true,
				'is-loading': isLoadingWallet,
			}"
			:disabled="isLoadingWallet"
			@click="getAddress"
		>
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
    async delegateTezos () {
      // todo: implement
    },
    async receiveTezos () {
      // todo: implement
    }
  }
})
</script>

<style></style>
