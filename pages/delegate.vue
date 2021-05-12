<template>
	<div>
		<form
			v-if="this.$store.state.connectedAddress"
			@submit.prevent="delegateTezos"
		>
			<div class="field is-horizontal">
				<div class="field-label">
					<label class="label" for="destinationAddress">To</label>
				</div>
				<div class="field-body">
					<div class="control">
						<input
							id="destinationAddress"
							v-model.trim="bakerAddress"
							class="input"
							type="text"
							placeholder="baker address"
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
							Delegate
						</button>
					</div>
				</div>
			</div>
		</form>
		<div v-if="delegationTransactionId" class="notification is-success">
			Delegation Transaction ID:
			<a
				rel="noopener"
				target="_blank"
				:href="`https://tzstats.com/${delegationTransactionId}`"
				>{{ delegationTransactionId }}</a
			>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { RpcClient } from "@taquito/rpc";
import TrezorConnect, { TezosDelegationOperation } from "trezor-connect";
import { TezosToolkit } from "@taquito/taquito";
import { ReadOnlySigner } from "~/assets/js/util";
import { TezosOperation } from "trezor-connect/lib/typescript/networks/tezos";

export default Vue.extend({
	name: "Delegate",
	data() {
		return {
			isSending: false,
			bakerAddress: "",
			error: "",
			delegationTransactionId: "",
		};
	},
	methods: {
		async delegateTezos() {
			this.isSending = true;
			this.error = "";

			const tezosRpc = new RpcClient(
				process.env.NUXT_ENV_TAQUITO_RPC_URL || ""
			);

			const blockHead = await tezosRpc.getBlockHeader();
			const headBlockHash: string = blockHead.hash;

			const tezos = new TezosToolkit(
				process.env.NUXT_ENV_TAQUITO_RPC_URL || ""
			);

			const publicKeyResult = await TrezorConnect.tezosGetPublicKey({
				path: this.$store.state.connectedAccountPath,
				showOnTrezor: false,
			});

			if (publicKeyResult.success === false) {
				this.error = "Failed to get public key. Please try again.";
				this.isSending = false;
				return;
			}

			tezos.setProvider({
				signer: new ReadOnlySigner(
					this.$store.state.connectedAddress,
					publicKeyResult.payload.publicKey
				),
			});

			let estimate = null;

			try {
				estimate = await tezos.estimate.setDelegate({
					source: this.$store.state.connectedAddress,
					delegate: this.bakerAddress,
				});
			} catch (error) {
				console.error(error);
				this.error = error.message;
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
				this.isSending = false;
				alert(
					"ERROR: Failed to get new counter for delegation. Please try again later."
				);
				return;
			}

			const operation: TezosOperation = {};

			// reveal address in this operation if need be
			if (!this.$store.state.connectedAccountIsActivated) {
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

			const delegationOptions = {
				source: this.$store.state.connectedAddress,
				delegate: this.bakerAddress,
				counter,
				fee: estimate.suggestedFeeMutez,
				gas_limit: estimate.gasLimit,
				storage_limit: estimate.storageLimit,
			};

			operation.delegation = delegationOptions;

			const result = await TrezorConnect.tezosSignTransaction({
				path: this.$store.state.connectedAccountPath,
				branch: headBlockHash,
				operation,
			});

			if (result.success === false) {
				this.error =
					"Delegation operation was not signed or attempt timed out.";
				this.isSending = false;
				return;
			}

			try {
				// inject transaction to the blockchain
				const delegationOperationId: string = await tezosRpc.injectOperation(
					result.payload.sig_op_contents
				);

				this.delegationTransactionId = delegationOperationId;

				// clear form
				this.bakerAddress = "";
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

<style scoped></style>
