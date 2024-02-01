import { createSignal, onMount, For, Show } from "solid-js";
import startCase from "lodash/startCase";
import { useStore } from "@nanostores/solid";
import { $trezorConnected } from "../stores/trezor.ts";
import { availableLocales, currentLocale, setCurrentLocale, t } from "../assets/js/i18n.ts";
import localeEmoji from "locale-emoji";
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

	const [route, setRoute] = createSignal<string>($router.get()?.route);

	onMount(() => {
		$router.listen((r) => {
			setRoute(r.route);
		})

		// change to the current local on init
		setCurrentLocale(navigator.language);
	})

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

			<a
				class="help-translate"
				href="https://localazy.com/p/briskett"
				rel="noopener"
				target="_blank"
			>
				🌎&nbsp;{t("help_translate")}
			</a>
			<select class="select language-switcher" onChange={({ target }) => setCurrentLocale(target.value)}>
				<For each={availableLocales}>
					{(locale) => (
						<option selected={locale === currentLocale()} value={locale}>
							{localeEmoji(locale)}&nbsp;{locale?.toUpperCase()}
						</option>
					)}
				</For>
			</select>

			<div class="logo-container">
				<img src="/images/logo.svg?url" alt="Briskett" />
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
						<a rel="noopener" target="_blank" href={`https://tzstats.com/${connectedAddressBaker()}`}>
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
