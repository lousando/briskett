<template>
	<div>
		<div v-if="isSending" class="notification has-text-centered">
			{{ statusText }}
		</div>
		<form v-if="$store.state.connectedAddress" @submit.prevent="undelegateTezos" class="is-align-items-center is-flex is-flex-direction-column is-justify-content-center">
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
			<div class="field is-horizontal is-flex is-justify-content-center">
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
							{{ $tCap("undelegate") }}
						</button>
					</div>
				</div>
			</div>
		</form>
		<div v-if="undelegationTransactionId" class="notification is-success">
			Delegation Transaction ID:
			<a
				rel="noopener"
				target="_blank"
				:href="`https://tzstats.com/${undelegationTransactionId}`"
				>{{ undelegationTransactionId }}</a
			>
		</div>
		<details>
			<summary>{{ $t("why_undelegate") }}</summary>
			<p>
				{{ $t("why_undelegate_answer") }}
			</p>
		</details>
	</div>
</template>

<script lang="ts">
import { RpcClient } from "@taquito/rpc";
import TrezorConnect, { type TezosOperation } from "@trezor/connect-web";
import { TezosToolkit } from "@taquito/taquito";
import confetti from "canvas-confetti";
import { ReadOnlySigner } from "../assets/js/util.ts";

export default {
	name: "Undelegate",
	scrollToTop: false,
	data() {
		return {
			statusText: "",
			isSending: false,
			error: "",
			undelegationTransactionId: "",
		};
	},
	head: {
		title: "Delegate",
	},
	methods: {
		async undelegateTezos() {
      if (!this.$store.state.connectedAddressBaker) {
        this.error = "Unable to undelegate if you have no current baker.";
        return;
      }

			this.isSending = true;
			this.error = "";

			const tezosRpc = new RpcClient(
				import.meta.env.PUBLIC_TAQUITO_RPC_URL || ""
			);

			this.statusText = "Retrieving head block...";

			const blockHead = await tezosRpc.getBlockHeader();
			const headBlockHash: string = blockHead.hash;

			const tezos = new TezosToolkit(
				import.meta.env.PUBLIC_TAQUITO_RPC_URL || ""
			);

			this.statusText = "Prompting for public key...";

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
				this.statusText = "Estimating undelegation cost...";

				estimate = await tezos.estimate.setDelegate({
					source: this.$store.state.connectedAddress,
          // estimate against current baker
					delegate: this.$store.state.connectedAddressBaker,
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
				this.statusText = "Fetching new counter...";

				const contract = await tezosRpc.getContract(
					this.$store.state.connectedAddress
				);

				counter = Number(contract.counter) + 1; // increment counter
			} catch (error) {
				console.error(error);
				this.isSending = false;
				this.error =
					"ERROR: Failed to get new counter for delegation. Please try again later.";
				return;
			}

			const operation: TezosOperation = {};

			// reveal address in this operation if need be
			if (!this.$store.state.connectedAccountIsRevealed) {
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

      /**
       * todo: figure out how to undelegate here
       */
			operation.delegation = {
        source: this.$store.state.connectedAddress,
        delegate: "",
        counter,
        fee: estimate.suggestedFeeMutez,
        gas_limit: estimate.gasLimit,
        storage_limit: estimate.storageLimit,
      };

			this.statusText = "Prompting to sign operation...";

			const result = await TrezorConnect.tezosSignTransaction({
				path: this.$store.state.connectedAccountPath,
				branch: headBlockHash,
				operation,
			});

			if (result.success === false) {
				this.error =
					"Undelegation operation was not signed or attempt timed out.";
				this.isSending = false;
				return;
			}

			try {
				this.statusText = "Attempting to injection operation to the network...";

				// inject transaction to the blockchain
				const undelegationOperationId: string = await tezosRpc.injectOperation(
					result.payload.sig_op_contents
				);

				this.undelegationTransactionId = undelegationOperationId;

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
	},
};
</script>

<style scoped></style>
