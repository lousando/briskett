import { createSignal, Show } from "solid-js";
import TrezorConnect, { type TezosOperation } from "@trezor/connect-web";
import { RpcClient } from "@taquito/rpc";
import { TezosToolkit } from "@taquito/taquito";
import confetti from "canvas-confetti";
import { ReadOnlySigner } from "../assets/js/util.ts";
import { useStore } from "@nanostores/solid";
import {
	$connectedAccountIsRevealed,
	$connectedAccountPath,
	$connectedAddress,
	$connectedAddressBalance
} from "../stores/connectedAccount.ts";
import { t } from "../assets/js/i18n.ts";
import startCase from "lodash/startCase";

const MINIMUM_BALANCE = 0.275;
const XTZ_SCALAR: number = 1000000;

export default function Send() {
	// global state
	const connectedAddress = useStore($connectedAddress);
	const connectedAddressBalance = useStore($connectedAddressBalance);
	const connectedAccountPath = useStore($connectedAccountPath);
	const connectedAccountIsRevealed = useStore($connectedAccountIsRevealed);
	// local state
	const [isSending, setIsSending] = createSignal<boolean>(false);
	const [statusText, setStatusText] = createSignal<string>("");
	const [destinationAddress, setDestinationAddress] = createSignal<string>("");
	const [amount, setAmount] = createSignal<number>(0);
	const [error, setError] = createSignal<string>("");
	const [latestTransactionId, setLatestTransactionId] = createSignal<string>("");

	const sendTezos = async () => {
		if (destinationAddress() === "") {
			setError("Please provide a destination address.");
			return;
		}

		if (amount() === 0 || amount() < 0) {
			setError("Please provide an amount.");
			return;
		}

		setIsSending(true);
		setError("");

		const tezosRpc = new RpcClient(
			import.meta.env.PUBLIC_TAQUITO_RPC_URL || ""
		);

		const tezos = new TezosToolkit(
			import.meta.env.PUBLIC_TAQUITO_RPC_URL || ""
		);

		let publicKeyResult = null;

		// reveal address in this operation if need be
		if (!connectedAccountIsRevealed()) {
			setStatusText("Prompting for public key...");

			publicKeyResult = await TrezorConnect.tezosGetPublicKey({
				path: connectedAccountPath(),
				showOnTrezor: false
			});

			if (!publicKeyResult.success) {
				setError("Failed to get public key. Please try again.");
				setIsSending(false);
				return;
			}
		}

		tezos.setProvider({
			signer: new ReadOnlySigner(
				connectedAddress(),
				publicKeyResult === null ? "" : publicKeyResult.payload.publicKey
			)
		});

		setStatusText("Retrieving head block...");

		const blockHead = await tezosRpc.getBlockHeader();
		const headBlockHash: string = blockHead.hash;

		// todo: check if address is valid

		let estimate = null;

		try {
			setStatusText("Estimating transaction cost...");

			estimate = await tezos.estimate.transfer({
				to: destinationAddress(),
				amount: amount()
			});
		} catch (error) {
			console.error(error);

			if (error?.message?.includes("balance_too_low")) {
				setError("Amount is greater than balance.");
			} else if (
				error?.message?.includes("empty_implicit_delegated_contract")
			) {
				setError("Cannot drain wallet; it must contain a minimum balance of 0.275ꜩ");
			} else {
				setError(error.message);
			}

			setIsSending(false);
			return;
		}

		if (estimate === null) {
			setError("Failed to get transaction estimates. Please try again later.");
			setIsSending(false);
			return;
		}

		let counter: number = 0;

		try {
			setStatusText("Fetching new counter...");
			const contract = await tezosRpc.getContract(
				connectedAddress()
			);

			/**
			 * Each transaction needs a counter that's given by a node.
			 * The counter is what prevents double spend in Tezos.
			 * A new counter is not given by a node until the previous transaction has
			 * left the mempool.
			 *
			 * The counter is like the invoice id.
			 * The counter is tied to a wallet and a new counter is generated after the
			 * last transaction leaves the mem pool.
			 */
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
		if (!connectedAccountIsRevealed()) {
			if (publicKeyResult === null) {
				setError("Need public key for reveal operation. Please try again.");
				setIsSending(false);
				return;
			}

			operation.reveal = {
				source: connectedAddress(),
				public_key: publicKeyResult.payload.publicKey,
				counter,
				fee: estimate.suggestedFeeMutez,
				gas_limit: estimate.gasLimit,
				storage_limit: estimate.storageLimit
			};

			counter += 1; // increment counter for delegation operation
		}

		operation.transaction = {
			source: connectedAddress(),
			destination: destinationAddress(),
			amount: amount() * XTZ_SCALAR,
			counter,
			fee: estimate.suggestedFeeMutez,
			gas_limit: estimate.gasLimit,
			storage_limit: estimate.storageLimit
		};

		setStatusText("Prompting to sign transaction...");

		const result = await TrezorConnect.tezosSignTransaction({
			path: connectedAccountPath(),
			branch: headBlockHash,
			operation
		});

		if (!result.success) {
			setError(result.payload.error);
			setIsSending(false);
			return;
		}

		try {
			setStatusText("Attempting to injection transaction to the network...");

			// inject transaction to the blockchain
			const transactionId: string = await tezosRpc.injectOperation(
				result.payload.sig_op_contents
			);

			setLatestTransactionId(transactionId);
			// clear form
			setDestinationAddress("");
			setAmount(0);

			// celebrate
			confetti({
				particleCount: 150,
				spread: 100,
				origin: { y: 0.7 }
			});
		} catch (error) {
			console.error(error);

			if (Array.isArray(error.body)) {
				setError(error.body[0]?.msg);
			} else {
				setError(error);
			}

			setIsSending(false);
		} finally {
			setIsSending(false);
		}
	};

	const setQuickAmount = (percentage: number) => {
		const quickAmount: number = Number(
			Number(
				(connectedAddressBalance() - MINIMUM_BALANCE) *
				percentage
			).toFixed(6)
		);

		if (quickAmount > 0) {
			setAmount(quickAmount);
		} else {
			setAmount(0);
		}
	};

	return (
		<div>
			<Show when={isSending()}>
				<div class="notification has-text-centered">
					{statusText()}
				</div>
			</Show>
			{connectedAddress() && (
				<form>
					<div class="field is-horizontal">
						<div class="field-label">
							<label class="label" for="destinationAddress">
								{startCase(t("to"))}
							</label>
						</div>
						<div class="field-body">
							<div class="field">
								<div class="control">
									<input
										id="destinationAddress"
										value={destinationAddress()}
										onChange={(e) => setDestinationAddress(e.target.value)}
										class="input"
										type="text"
										placeholder={t("destination_address")}
										disabled={isSending()}
										required
									/>
								</div>
							</div>
						</div>
					</div>
					<div class="field is-horizontal">
						<div class="field-label">
							<label class="label" for="amount">
								{startCase(t("amount"))}
							</label>
						</div>
						<div class="field-body">
							<div class="field has-addons">
								<div class="control is-expanded">
									<input
										id="amount"
										value={amount()}
										onChange={(e) => setAmount(Number(e.target.value))}
										class="input"
										type="number"
										placeholder="XTZ"
										min={1 / XTZ_SCALAR}
										step={1 / XTZ_SCALAR}
										disabled={isSending()}
										required
									/>
								</div>
								<div class="control">
									<button
										type="button"
										class="button"
										disabled={isSending()}
										onClick={() => setQuickAmount(0.25)}
									>
										25%
									</button>
								</div>
								<div class="control">
									<button
										type="button"
										class="button"
										disabled={isSending()}
										onClick={() => setQuickAmount(0.5)}
									>
										50%
									</button>
								</div>
								<div class="control">
									<button
										type="button"
										class="button"
										disabled={isSending()}
										onClick={() => setQuickAmount(0.75)}
									>
										75%
									</button>
								</div>
								<div class="control">
									<button
										type="button"
										class="button"
										disabled={isSending()}
										onClick={() => setQuickAmount(1)}
									>
										100%
									</button>
								</div>
							</div>
						</div>
					</div>
					<Show when={error()}>
						<div class="field is-horizontal">
							<div class="field-body">
								<div class="notification is-danger">{error()}</div>
							</div>
						</div>
					</Show>
					<div class="field is-horizontal">
						<div class="field-label">
							<label class="label">
								{/*	intentionally left blank */}
							</label>
						</div>
						<div class="field-body">
							<div class="control">
								<button
									type="button"
									class={`button is-primary is-medium ${isSending() ? "is-loading" : ""}`}
									disabled={isSending()}
									onClick={sendTezos}
								>
									{startCase(t("send"))}
								</button>
							</div>
						</div>
					</div>
				</form>
			)}
			<Show when={latestTransactionId()}>
				<div class="notification is-success">
					Latest Transaction ID:
					<a
						rel="noopener"
						target="_blank"
						href={`https://tzstats.com/${latestTransactionId()}`}
					>
						{latestTransactionId()}
					</a>
				</div>
			</Show>
			<details>
				<summary>{t("why_cant_i_send_all_tezos")}</summary>
				<p>
					{t("why_cant_i_send_all_tezos_answer")}
				</p>
			</details>
		</div>
	);
}
