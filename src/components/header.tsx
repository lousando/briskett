import { createSignal, onMount, Show } from "solid-js";
import { startCase} from "../assets/js/util.ts";
import { useStore } from "@nanostores/solid";
import { $trezorConnected } from "../stores/trezor.ts";
import { t } from "../assets/js/i18n.ts";
import TezosAddressPaths from "../assets/js/tezosAddressPaths.ts";
import {
	$connectedAccountPath,
	$connectedAddress,
	$connectedAddressBaker,
	$connectedAddressBalance
} from "../stores/connectedAccount.ts";
import { getPagePath } from "@nanostores/router";
import { $router } from "../assets/js/router.ts";

export default function Header() {
	const trezorConnected = useStore($trezorConnected);
	const connectedAddress = useStore($connectedAddress);
	const connectedAddressBalance = useStore($connectedAddressBalance);
	const connectedAccountPath = useStore($connectedAccountPath);
	const connectedAddressBaker = useStore($connectedAddressBaker);

	const [route, setRoute] = createSignal<string>($router.get()?.route ?? "");

	onMount(() => {
		$router.listen((r) => {
			setRoute(r?.route ?? "");
		});
	});

	return (
		<header>
			<div class="trezor-status-container">
				{t("trezor_is")}&nbsp;
				<span
					classList={{
						"trezor-status": true,
						"trezor-status--connected": trezorConnected() === true,
						"trezor-status--disconnected": trezorConnected() === false
					}}
				>
            {trezorConnected() ? t("connected")?.toLocaleUpperCase() : t("disconnected")?.toLocaleUpperCase()}
          </span>
			</div>

			<Show when={connectedAddress()}>
				<div class="address-number-container">
          <span title={connectedAccountPath()}>
            {t("address")?.toLocaleUpperCase()}&nbsp;<span class="address-number">{getCurrentAddressNum()}</span>
          </span>
				</div>
			</Show>

			<div class="logo-container">
				<a href={getPagePath($router, "home")}>
					<img src="/images/logo.svg?url" alt="Briskett" />
				</a>
				<span class="beta-text">[{t("beta")}]</span>
			</div>

			<Show when={connectedAddress()}>
				<h3 class="balance is-size-3">
					{startCase(t("balance"))}: {connectedAddressBalance()}
				</h3>
				<h4 class="is-size-4">
					{startCase(t("address"))}: {connectedAddress()}
				</h4>
				<Show when={connectedAddressBaker()}>
					<h4 class="is-size-4">
						{startCase(t("baker"))}:&nbsp;
						<a rel="noopener" target="_blank" href={`https://tzkt.io/${connectedAddressBaker()}`}>
							{connectedAddressBaker()}
						</a>
					</h4>
				</Show>
				<div class="tabs is-centered">
					<ul>
						<li>
							<a href={getPagePath($router, "send")} classList={{
								"active": route() === "send"
							}}>{startCase(t("send"))}</a>
						</li>
						<li>
							<a href={getPagePath($router, "delegate")} classList={{
								"active": route() === "delegate"
							}}>{startCase(t("delegate"))}</a>
						</li>
						<li>
							{/* todo: enable when undelegation has been figured out */}
							{/* <a href={getPagePath($router, "undelegate")} classList={{*/}
							{/*	 "active": route() === "undelegate"*/}
							{/* }}>{startCase(t("undelegate"))}</a>*/}
						</li>
						<li>
							<a href={getPagePath($router, "receive")} classList={{
								"active": route() === "receive"
							}}>{startCase(t("receive"))}</a>
						</li>
					</ul>
				</div>
			</Show>
		</header>
	);
};

/**
 * Private Functions
 */
function getCurrentAddressNum() {
	return (
		TezosAddressPaths.indexOf($connectedAccountPath.get()) + 1
	);
}
