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
			{{ $t("verify_address") }}
		</button>
		<details>
			<summary>{{ $t("why_verify_my_address") }}</summary>
			<p>
				{{ $t("why_verify_my_address_answer") }}
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
