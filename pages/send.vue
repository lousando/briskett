<template>
	<div>
		<form v-if="this.$store.state.connectedAddress" @submit.prevent="sendTezos">
			<div class="field is-horizontal">
				<div class="field-label">
					<label class="label" for="destinationAddress">To</label>
				</div>
				<div class="field-body">
					<div class="control">
						<input
							id="destinationAddress"
							v-model.trim="destinationAddress"
							class="input"
							type="text"
							placeholder="destination address"
							required
						/>
					</div>
				</div>
			</div>
			<div class="field is-horizontal">
				<div class="field-label">
					<label class="label">Amount</label>
				</div>
				<div class="field-body">
					<div class="control">
						<input
							v-model.number="amount"
							class="input"
							type="number"
							placeholder="XTZ"
							:min="1 / XTZ_SCALAR"
							:step="1 / XTZ_SCALAR"
							required
						/>
					</div>
				</div>
			</div>
			<div v-if="error" class="field is-horizontal">
				<div class="field-label">
					<!-- left empty for spacing -->
				</div>
				<div class="field-body">
					<div class="notification is-danger">
						{{ error }}
					</div>
				</div>
			</div>
			<div class="field is-horizontal">
				<div class="field-label">
					<!-- left empty for spacing -->
				</div>
				<div class="field-body">
					<div class="control">
						<button
							type="submit"
							:class="{
								button: true,
								'is-loading': isSending,
							}"
							:disabled="isSending"
						>
							Send
						</button>
					</div>
				</div>
			</div>
		</form>
		<div v-if="latestTransactionId" class="notification is-success">
			Latest Transaction ID:
			<a
				rel="noopener"
				target="_blank"
				:href="`https://tzstats.com/${latestTransactionId}`"
				>{{ latestTransactionId }}</a
			>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import TrezorConnect from "trezor-connect";
import { RpcClient } from "@taquito/rpc";
import { TezosToolkit } from "@taquito/taquito";
import { ReadOnlySigner } from "~/assets/js/util";

const XTZ_SCALAR: number = 1000000;

export default Vue.extend({
	name: "Send",
	data() {
		return {
			XTZ_SCALAR,
			isSending: false,
			destinationAddress: "",
			amount: 0,
			error: "",
			latestTransactionId: "",
		};
	},
	methods: {
		async sendTezos() {
			this.isSending = true;
			this.error = "";

			const tezosRpc = new RpcClient(
				process.env.NUXT_ENV_TAQUITO_RPC_URL || ""
			);

			const tezos = new TezosToolkit(
				process.env.NUXT_ENV_TAQUITO_RPC_URL || ""
			);

			tezos.setProvider({
				signer: new ReadOnlySigner(this.$store.state.connectedAddress, ""),
			});

			const blockHead = await tezosRpc.getBlockHeader();
			const headBlockHash: string = blockHead.hash;

			// todo: check if address is valid

			let estimate = null;

			try {
				estimate = await tezos.estimate.transfer({
					to: this.destinationAddress,
					amount: this.amount,
				});
			} catch (error) {
				console.error(error);

				if (error.message?.includes("balance_too_low")) {
					this.error = "Amount is greater than balance.";
				} else {
					this.error = error.message;
				}

				this.isSending = false;
				return;
			}

			if (estimate === null) {
				this.error =
					"Failed to get transaction estimates. Please try again later.";
				this.isSending = false;
				return;
			}

			let counter: number = 0;

			try {
				const contract = await tezosRpc.getContract(
					this.$store.state.connectedAddress
				);

				counter = Number(contract.counter) + 1; // increment counter
			} catch (error) {
				console.error(error);
				alert(
					"ERROR: Failed to get new counter for send transaction. Please try again later."
				);
				return;
			}

			const transactionOptions = {
				source: this.$store.state.connectedAddress,
				destination: this.destinationAddress,
				amount: this.amount * XTZ_SCALAR,
				counter,
				// todo: add ability to customize these options
				fee: estimate.suggestedFeeMutez,
				gas_limit: estimate.gasLimit,
				storage_limit: estimate.storageLimit,
			};

			const result = await TrezorConnect.tezosSignTransaction({
				path: this.$store.state.connectedAccountPath,
				branch: headBlockHash,
				operation: {
					transaction: transactionOptions,
				},
			});

			if (result.success === false) {
				this.error = result.payload.error;
				this.isSending = false;
				return;
			}

			try {
				// inject transaction to the blockchain
				const transactionId: string = await tezosRpc.injectOperation(
					result.payload.sig_op_contents
				);

				this.latestTransactionId = transactionId;

				// clear form
				this.destinationAddress = "";
				this.amount = 0;
			} catch (error) {
				console.error(error);

				if (Array.isArray(error.body)) {
					this.error = error.body[0]?.msg;
				} else {
					this.error = error;
				}

				this.isSending = false;
			} finally {
				this.isSending = false;
			}
		},
	},
});
</script>

<style scoped>
form {
	text-align: left;
	margin: 30px;
}

.control {
	width: 100%;
}
</style>
