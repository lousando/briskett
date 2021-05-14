<template>
	<div v-if="this.$store.state.connectedAddress">
		<vue-qrcode
			:value="this.$store.state.connectedAddress"
			:options="{
				errorCorrectionLevel: 'H',
				width: 300,
			}"
		/>
		<div class="field">
			<div class="control">
				<input
					type="text"
					class="input"
					:value="this.$store.state.connectedAddress"
					readonly
				/>
			</div>
		</div>
		<button class="button is-primary" @click="verifyAddress">
			Verify Address
		</button>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import TrezorConnect from "trezor-connect";

export default Vue.extend({
	name: "Receive",
	components: {
		VueQrcode,
	},
	scrollToTop: false,
	methods: {
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
