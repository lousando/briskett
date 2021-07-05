<template>
	<div v-if="$store.state.connectedAddress">
		<vue-qrcode
			:value="$store.state.connectedAddress"
			:options="{
				errorCorrectionLevel: 'H',
				width: 300,
			}"
		/>
		<div class="field">
			<div class="control">
				<input
					id="receiveAddress"
					type="text"
					class="input"
					aria-label="connected account address"
					:value="$store.state.connectedAddress"
					readonly
					@click="copyAddress"
				/>
			</div>
		</div>
		<button class="button is-primary" @click="verifyAddress">
			Verify Address
		</button>
		<details>
			<summary>Why verify my address?</summary>
			<p>
				Although the chances are slim, in the event an attacker gains access to
				this page (like via a malicious browser extension) they could swap out
				your address for their own. This would lead to them getting the coins
				that are about to be sent out and NOT YOU! Please practice good security
				by verifying your address, especially when sending very large amounts.
			</p>
		</details>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import TrezorConnect from "trezor-connect";
import tippy from "tippy.js";

export default Vue.extend({
	name: "Receive",
	components: {
		VueQrcode,
	},
	scrollToTop: false,
	head: {
		title: "Receive",
	},
	mounted() {
		tippy("#receiveAddress", {
			content: "Copied!",
			trigger: "click",
		});
	},
	methods: {
		copyAddress({ target }: any) {
			target.select();
			navigator.clipboard.writeText(this.$store.state.connectedAddress);
		},
		verifyAddress() {
			TrezorConnect.tezosGetAddress({
				path: this.$store.state.connectedAccountPath,
				showOnTrezor: true,
			});
		},
	},
});
</script>

<style scoped>
input[type="text"] {
	text-align: center;
}
</style>
