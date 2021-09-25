<template>
	<div>
		<h4 v-t="'slogan'" class="is-size-4"></h4>
		<div class="address-path-selector">
			<div class="select">
				<select
					:title="$store.state.connectedAccountPath"
					@change="onChangeAddressPath"
				>
					<option :value="tezosAddressPaths[0]" :title="tezosAddressPaths[0]">
						{{ $tCap("address") }} 1
					</option>
					<option :value="tezosAddressPaths[1]" :title="tezosAddressPaths[1]">
						{{ $tCap("address") }} 2
					</option>
					<option :value="tezosAddressPaths[2]" :title="tezosAddressPaths[2]">
						{{ $tCap("address") }} 3
					</option>
					<option :value="tezosAddressPaths[3]" :title="tezosAddressPaths[3]">
						{{ $tCap("address") }} 4
					</option>
					<option :value="tezosAddressPaths[4]" :title="tezosAddressPaths[4]">
						{{ $tCap("address") }} 5
					</option>
				</select>
			</div>
		</div>
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
import TezosAddressPaths from "~/assets/js/tezosAddressPaths";

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
			tezosAddressPaths: TezosAddressPaths,
			isLoadingWallet: false,
			connectedAddressBalance: "0.00",
		};
	},
	head: {
		title: "Home",
	},
	methods: {
		onChangeAddressPath(event: Event) {
			const target = event.target as HTMLSelectElement;
			this.$store.commit("setConnectedAccountPath", target.value);
		},
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

.address-path-selector {
	margin: 1rem 0;
}
</style>
