<template>
	<div>
		<h4 v-t="'slogan'" class="is-size-4"></h4>
		<button
			v-if="!$store.connectedAddress"
			:class="{
				button: true,
				'is-primary': true,
				'is-large': true,
				'is-loading': isLoadingWallet,
			}"
			:disabled="isLoadingWallet"
			@click="getAddress"
		>
			{{ $t("connect_trezor") }}*
		</button>
		<p>*{{ $t("connect_trezor_footnote") }}</p>
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
			appUrl: process.env.NUXT_ENV_TREZOR_MANIFEST_APP_URL || ""
		}
	});
}

export default Vue.extend({
	data() {
		return {
			isLoadingWallet: false,
			connectedAddressBalance: "0.00"
		};
	},
	head: {
		title: "Home"
	},
	methods: {
		getAddress() {
			// prevent dead clicks
			this.isLoadingWallet = true;

			TrezorConnect.tezosGetAddress({
				// todo: find a way to let user select address
				path: this.$store.state.connectedAccountPath,
				showOnTrezor: false
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
		}
	}
});
</script>

<style scoped>
p {
	margin-top: 20px;
}
</style>
