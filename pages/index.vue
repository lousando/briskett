<template>
	<div>
		<h4 class="is-size-4">The delicious Tezos wallet.</h4>
		<button
			v-if="!this.$store.connectedAddress"
			:class="{
				button: true,
				'is-primary': true,
				'is-large': true,
				'is-loading': isLoadingWallet,
			}"
			:disabled="isLoadingWallet"
			@click="getAddress"
		>
			Connect Trezor*
		</button>
		<p>
			*Might need to disable ad blocker in order for Trezor Connect to work.<br />
			Brave users, take down Brave Shields.
		</p>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import TrezorConnect from "trezor-connect";

// only execute on browser
if (process.client) {
	TrezorConnect.init({
		connectSrc:
			process.env.NODE_ENV === "development" ? "https://localhost:8088/" : "",
		lazyLoad: true, // inject once first TrezorConnect method is called
		manifest: {
			email: process.env.NUXT_ENV_TREZOR_MANIFEST_EMAIL || "",
			appUrl: process.env.NUXT_ENV_TREZOR_MANIFEST_APP_URL || "",
		},
	});
}

export default Vue.extend({
	data() {
		return {
			isLoadingWallet: false,
			connectedAddressBalance: "0.00",
		};
	},
	methods: {
		getAddress() {
			// prevent dead clicks
			this.isLoadingWallet = true;

			TrezorConnect.tezosGetAddress({
				// todo: find a way to let user select address
				path: this.$store.state.connectedAccountPath,
				showOnTrezor: false,
			}).then((result) => {
				if (result.success) {
					this.$store.commit("setConnectedAddress", result.payload.address);
					this.$store.dispatch("loadConnectedAccountData");
					this.$nuxt.$router.push("/send");
				} else {
					// re-enable button for user
					this.isLoadingWallet = false;
					// todo: prompt them to try again
				}
			});
		},
	},
});
</script>

<style scoped>
p {
	margin-top: 20px;
}
</style>
