import { useStore } from "@nanostores/solid";
import { resolveTemplate, t } from "../assets/js/i18n.ts";
import {
	$connectedAccountOperations,
	$connectedAddress,
	$connectedAddressBaker,
} from "../stores/connectedAccount.ts";
import { For, Show } from "solid-js";
import { startCase } from "../assets/js/util.ts";

const XTZ_SCALAR: number = 1000000;

export default function AccountOperations() {
	// global state
	const connectedAddress = useStore($connectedAddress);
	const connectedAddressBaker = useStore($connectedAddressBaker);
	const connectedAccountOperations = useStore($connectedAccountOperations);

	return (
		<Show when={connectedAccountOperations().length > 0}>
			<section class="section">
				<div class="operations">
					<h3 class="is-size-3">
						{resolveTemplate(t("last_operations"), {
							count: connectedAccountOperations().length,
						})}
					</h3>
					<For each={connectedAccountOperations()}>
						{(operation, operationIndex) => (
							<div class="operation">
								{operationIndex() === 0 && (
									<div class="header">{startCase(t("type"))}</div>
								)}
								{operationIndex() === 0 && (
									<div class="header">{startCase(t("amount"))}</div>
								)}
								{operationIndex() === 0 && (
									<div class="header">{startCase(t("time"))}</div>
								)}
								{operationIndex() === 0 && (
									<div class="header">{startCase(t("address"))}</div>
								)}
								{operationIndex() === 0 && (
									<div class="header">{startCase(t("hash"))}</div>
								)}
								{/* Type */}
								{operation.type === "transaction" &&
									operation.sender.address === connectedAddressBaker() && (
										<span class="reward">{startCase(t("reward"))}</span>
									)}
								{operation.type === "transaction" &&
									operation.sender.address !== connectedAddress() && (
										<span class="receive">{startCase(t("receive"))}</span>
									)}
								{operation.type === "transaction" &&
									operation.sender.address === connectedAddress() && (
										<span class="send">{startCase(t("send"))}</span>
									)}
								{operation.type === "delegation" && (
									<span>{startCase(t("delegation"))}</span>
								)}
								{operation.type === "reveal" && (
									<span
										class="reveal"
										aria-label={t("reveal_operation_details")}
										title={t("reveal_operation_details")}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											role="img"
											viewBox="0 0 512 512"
										>
											<path
												fill="currentColor"
												d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
											/>
										</svg>
										&nbsp;
										{startCase(t("reveal"))}
									</span>
								)}
								{/* Amount */}
								{/* convert from mutez to tezos */}
								<div class="amount">{operation.amount / XTZ_SCALAR ?? 0}</div>
								{/* Time */}
								<div>{operation.time}</div>
								{/* Address */}
								{operation.type === "transaction" &&
									operation.sender.address === connectedAddress() && (
										<a
											rel="noopener"
											target="_blank"
											href={`https://tzkt.io/${operation.target.address}`}
										>
											{operation.target.address.slice(0, 5)}...
											{operation.target.address.slice(-5)}
										</a>
									)}
								{operation.type === "transaction" &&
									operation.sender.address !== connectedAddress() && (
										<a
											rel="noopener"
											target="_blank"
											href={`https://tzkt.io/${operation.sender.address}`}
										>
											{operation.sender.address.slice(0, 5)}...
											{operation.sender.address.slice(-5)}
										</a>
									)}
								{operation.type !== "transaction" && <span>&mdash;</span>}
								{/* Hash */}
								<a
									rel="noopener"
									target="_blank"
									href={`https://tzkt.io/${operation.hash}`}
								>
									{operation.hash.slice(0, 5)}...{operation.hash.slice(-5)}
								</a>
							</div>
						)}
					</For>
				</div>
			</section>
		</Show>
	);
}
