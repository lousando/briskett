import { createSignal, Show } from "solid-js";
import { RpcClient } from "@taquito/rpc";
import TrezorConnect, { type TezosOperation } from "@trezor/connect-web";
import { TezosToolkit } from "@taquito/taquito";
import confetti from "canvas-confetti";
import { ReadOnlySigner, startCase } from "../assets/js/util.ts";
import { t } from "../assets/js/i18n.ts";
import { useStore } from "@nanostores/solid";
import {
	$connectedAccountIsRevealed,
	$connectedAccountPath,
	$connectedAddress,
} from "../stores/connectedAccount.ts";

export default function Delegate() {
	// global state
	const connectedAddress = useStore($connectedAddress);
	const connectedAccountPath = useStore($connectedAccountPath);
	const connectedAccountIsRevealed = useStore($connectedAccountIsRevealed);
	// local state
	const [statusText, setStatusText] = createSignal<string>("");
	const [isSending, setIsSending] = createSignal<boolean>(false);
	const [bakerAddress, setBakerAddress] = createSignal<string>("");
	const [error, setError] = createSignal<string>("");
	const [delegationTransactionId, setDelegationTransactionId] =
		createSignal<string>("");

	const delegateTezos = async () => {
		if (bakerAddress() === "") {
			setError("Please enter a baker address");
			return;
		}

		setIsSending(true);
		setError("");

		const tezosRpc = new RpcClient(
			import.meta.env.PUBLIC_TAQUITO_RPC_URL || "",
		);

		setStatusText("Retrieving head block...");

		const blockHead = await tezosRpc.getBlockHeader();
		const headBlockHash: string = blockHead.hash;

		const tezos = new TezosToolkit(
			import.meta.env.PUBLIC_TAQUITO_RPC_URL || "",
		);

		setStatusText("Prompting for public key...");

		const publicKeyResult = await TrezorConnect.tezosGetPublicKey({
			path: connectedAccountPath(),
			showOnTrezor: false,
		});

		if (!publicKeyResult.success) {
			setError("Failed to get public key. Please try again.");
			setIsSending(false);
			return;
		}

		tezos.setProvider({
			signer: new ReadOnlySigner(
				connectedAddress(),
				publicKeyResult.payload.publicKey
			)
		});

		let estimate = null;

		try {
			setStatusText("Estimating delegation cost...");

			estimate = await tezos.estimate.setDelegate({
				source: connectedAddress(),
				delegate: bakerAddress(),
			});
		} catch (error: any) {
			console.error(error);
			setError(error.message);
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

			const contract = await tezosRpc.getContract(connectedAddress());

			counter = Number(contract.counter) + 1; // increment counter
		} catch (error) {
			console.error(error);
			setError(
				"ERROR: Failed to get new counter for delegation. Please try again later.",
			);
			setIsSending(false);
			return;
		}

		const operation: TezosOperation = {};

		// reveal address in this operation if need be
		if (!connectedAccountIsRevealed()) {
			operation.reveal = {
				source: connectedAddress(),
				public_key: publicKeyResult.payload.publicKey,
				counter,
				fee: estimate.suggestedFeeMutez,
				gas_limit: estimate.gasLimit,
				storage_limit: estimate.storageLimit,
			};

			counter += 1; // increment counter for delegation operation
		}

		const delegationOptions = {
			source: connectedAddress(),
			delegate: bakerAddress(),
			counter,
			fee: estimate.suggestedFeeMutez,
			gas_limit: estimate.gasLimit,
			storage_limit: estimate.storageLimit,
		};

		operation.delegation = delegationOptions;

		setStatusText("Prompting to sign operation...");

		const result = await TrezorConnect.tezosSignTransaction({
			path: connectedAccountPath(),
			branch: headBlockHash,
			operation,
		});

		if (!result.success) {
			setError("Delegation operation was not signed or attempt timed out.");
			setIsSending(false);
			return;
		}

		try {
			setStatusText("Attempting to injection operation to the network...");

			// inject transaction to the blockchain
			const delegationOperationId: string = await tezosRpc.injectOperation(
				result.payload.sig_op_contents,
			);

			setDelegationTransactionId(delegationOperationId);

			// clear form
			setBakerAddress("");

			// celebrate
			confetti({
				particleCount: 150,
				spread: 100,
				origin: { y: 0.7 },
			});
		} catch (error: any) {
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

	return (
		<div>
			<Show when={isSending()}>
				<div class="notification has-text-centered">{statusText()}</div>
			</Show>
			<Show when={connectedAddress()}>
				<form>
					<div class="field is-horizontal">
						<div class="field-label">
							<label class="label" for="destinationAddress">
								{t("to")}
							</label>
						</div>
						<div class="field-body">
							<div class="field">
								<div class="control">
									<input
										id="destinationAddress"
										value={bakerAddress()}
										onChange={(e) => setBakerAddress(e.target.value)}
										class="input"
										type="text"
										placeholder={t("baker_address")}
										disabled={isSending()}
										required
									/>
								</div>
							</div>
						</div>
					</div>
					<Show when={error()}>
						<div class="field is-horizontal">
							<div class="field-label">{/* left empty for spacing */}</div>
							<div class="field-body">
								<div class="notification is-danger">{error()}</div>
							</div>
						</div>
					</Show>
					<div class="field is-horizontal">
						<div class="field-label">{/* left empty for spacing */}</div>
						<div class="field-body">
							<div class="control">
								<button
									type="button"
									classList={{
										button: true,
										"is-primary": true,
										"is-medium": true,
										"is-loading": isSending(),
									}}
									disabled={isSending()}
									onclick={delegateTezos}
								>
									{startCase(t("delegate"))}
								</button>
							</div>
						</div>
					</div>
				</form>
			</Show>
			<Show when={delegationTransactionId()}>
				<div class="notification is-success">
					Delegation Transaction ID:
					<a
						class="ml-1"
						rel="noopener"
						target="_blank"
						href={`https://tzkt.io/${delegationTransactionId()}`}
					>
						{delegationTransactionId()}
					</a>
				</div>
			</Show>
			<details>
				<summary>{t("why_delegate")}</summary>
				<p>{t("why_delegate_answer")}</p>
			</details>
			<details>
				<summary>{t("will_my_coins_be_locked_up")}</summary>
				<p>{t("will_my_coins_be_locked_up_answer")}</p>
			</details>
		</div>
	);
}
