<template>
	<div>
		<div v-if="isSending" class="notification has-text-centered">
			{{ statusText }}
		</div>
		<form v-if="$store.state.connectedAddress" @submit.prevent="sendTezos">
			<div class="field is-horizontal">
				<div class="field-label">
					<label class="label" for="destinationAddress">{{
						$tCap("to")
					}}</label>
				</div>
				<div class="field-body">
					<div class="field">
						<div class="control">
							<input
								id="destinationAddress"
								v-model.trim="destinationAddress"
								class="input"
								type="text"
								:placeholder="$t('destination_address')"
								:disabled="isSending"
								required
							/>
						</div>
					</div>
				</div>
			</div>
			<div class="field is-horizontal">
				<div class="field-label">
					<label class="label" for="amount">{{ $tCap("amount") }}</label>
				</div>
				<div class="field-body">
					<div class="field has-addons">
						<div class="control is-expanded">
							<input
								id="amount"
								v-model.number="amount"
								class="input"
								type="number"
								placeholder="XTZ"
								:min="1 / XTZ_SCALAR"
								:step="1 / XTZ_SCALAR"
								:disabled="isSending"
								required
							/>
						</div>
						<div class="control">
							<button
								type="button"
								class="button"
								:disabled="isSending"
								@click="setQuickAmount(0.25)"
							>
								25%
							</button>
						</div>
						<div class="control">
							<button
								type="button"
								class="button"
								:disabled="isSending"
								@click="setQuickAmount(0.5)"
							>
								50%
							</button>
						</div>
						<div class="control">
							<button
								type="button"
								class="button"
								:disabled="isSending"
								@click="setQuickAmount(0.75)"
							>
								75%
							</button>
						</div>
						<div class="control">
							<button
								type="button"
								class="button"
								:disabled="isSending"
								@click="setQuickAmount(1)"
							>
								100%
							</button>
						</div>
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
								'is-primary': true,
								'is-medium': true,
								'is-loading': isSending,
							}"
							:disabled="isSending"
						>
							{{ $tCap("send") }}
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
		<details>
			<summary>{{ $t("why_cant_i_send_all_tezos") }}</summary>
			<p>
				{{ $t("why_cant_i_send_all_tezos_answer") }}
			</p>
		</details>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import TrezorConnect, { TezosOperation } from "@trezor/connect-web";
import { RpcClient } from "@taquito/rpc";
import { TezosToolkit } from "@taquito/taquito";
import confetti from "canvas-confetti";
import { ReadOnlySigner } from "~/assets/js/util";

const MINIMUM_BALANCE = 0.275;
const XTZ_SCALAR: number = 1000000;

export default Vue.extend({
	name: "Send",
	scrollToTop: false,
	data() {
		return {
			XTZ_SCALAR,
			statusText: "",
			isSending: false,
			destinationAddress: "",
			amount: 0,
			error: "",
			latestTransactionId: "",
		};
	},
	head: {
		title: "Send",
	},
	methods: {
		async sendTezos() {
			if (this.destinationAddress === "") {
				this.error = "Please provide a destination address.";
				return;
			}

			if (this.amount === 0 || this.amount < 0) {
				this.error = "Please provide an amount.";
				return;
			}

			this.isSending = true;
			this.error = "";

			const tezosRpc = new RpcClient(
				process.env.NUXT_ENV_TAQUITO_RPC_URL || ""
			);

			const tezos = new TezosToolkit(
				process.env.NUXT_ENV_TAQUITO_RPC_URL || ""
			);

			let publicKeyResult = null;

			// reveal address in this operation if need be
			if (!this.$store.state.connectedAccountIsRevealed) {
				this.statusText = "Prompting for public key...";

				publicKeyResult = await TrezorConnect.tezosGetPublicKey({
					path: this.$store.state.connectedAccountPath,
					showOnTrezor: false,
				});

				if (publicKeyResult.success === false) {
					this.error = "Failed to get public key. Please try again.";
					this.isSending = false;
					return;
				}
			}

			tezos.setProvider({
				signer: new ReadOnlySigner(
					this.$store.state.connectedAddress,
					publicKeyResult === null ? "" : publicKeyResult.payload.publicKey
				),
			});

			this.statusText = "Retrieving head block...";

			const blockHead = await tezosRpc.getBlockHeader();
			const headBlockHash: string = blockHead.hash;

			// todo: check if address is valid

			let estimate = null;

			try {
				this.statusText = "Estimating transaction cost...";

				estimate = await tezos.estimate.transfer({
					to: this.destinationAddress,
					amount: this.amount,
				});
			} catch (error) {
				console.error(error);

				if (error.message?.includes("balance_too_low")) {
					this.error = "Amount is greater than balance.";
				} else if (
					error.message?.includes("empty_implicit_delegated_contract")
				) {
					this.error =
						"Cannot drain wallet; it must contain a minimum balance of 0.275ꜩ";
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
				this.statusText = "Fetching new counter...";

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

			const operation: TezosOperation = {};

			// reveal address in this operation if need be
			if (!this.$store.state.connectedAccountIsRevealed) {
				if (publicKeyResult === null) {
					this.error =
						"Need public key for reveal operation. Please try again.";
					this.isSending = false;
					return;
				}

				operation.reveal = {
					source: this.$store.state.connectedAddress,
					public_key: publicKeyResult.payload.publicKey,
					counter,
					fee: estimate.suggestedFeeMutez,
					gas_limit: estimate.gasLimit,
					storage_limit: estimate.storageLimit,
				};

				counter += 1; // increment counter for delegation operation
			}

			operation.transaction = {
				source: this.$store.state.connectedAddress,
				destination: this.destinationAddress,
				amount: this.amount * XTZ_SCALAR,
				counter,
				fee: estimate.suggestedFeeMutez,
				gas_limit: estimate.gasLimit,
				storage_limit: estimate.storageLimit,
			};

			this.statusText = "Prompting to sign transaction...";

			const result = await TrezorConnect.tezosSignTransaction({
				path: this.$store.state.connectedAccountPath,
				branch: headBlockHash,
				operation,
			});

			if (result.success === false) {
				this.error = result.payload.error;
				this.isSending = false;
				return;
			}

			try {
				this.statusText =
					"Attempting to injection transaction to the network...";

				// inject transaction to the blockchain
				const transactionId: string = await tezosRpc.injectOperation(
					result.payload.sig_op_contents
				);

				this.latestTransactionId = transactionId;

				// clear form
				this.destinationAddress = "";
				this.amount = 0;

				// celebrate
				confetti({
					particleCount: 150,
					spread: 100,
					origin: { y: 0.7 },
				});
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
		setQuickAmount(percentage: number) {
			const quickAmount: number = Number(
				Number(
					(this.$store.state.connectedAddressBalance - MINIMUM_BALANCE) *
						percentage
				).toFixed(6)
			);

			if (quickAmount > 0) {
				this.amount = quickAmount;
			} else {
				this.amount = 0;
			}
		},
	},
});
</script>

<style scoped></style>
