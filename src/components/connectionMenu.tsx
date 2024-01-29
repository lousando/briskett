import { createSignal, For } from "solid-js";
import startCase from "lodash/startCase";
import { useStore } from "@nanostores/solid";
import { t } from "../assets/js/i18n.ts";
import TrezorConnect from "@trezor/connect-web";
import TezosAddressPaths from "../assets/js/tezosAddressPaths.ts";
import { $connectedAccountPath, $connectedAddress, loadConnectedAccountData } from "../stores/connectedAccount.ts";
import { openPage } from "@nanostores/router";
import { $router } from "../assets/js/router.ts";

export default function ConnectionMenu() {
	const connectedAccountPath = useStore($connectedAccountPath);
	const [isLoadingWallet, setIsLoadingWallet] = createSignal(false);

	const getAddress = () => {
		// prevent dead clicks
		setIsLoadingWallet(true);

		TrezorConnect.tezosGetAddress({
			// todo: find a way to let user select address
			path: $connectedAccountPath.get(),
			showOnTrezor: false
		}).then(async (result) => {
			if (result.success) {
				$connectedAddress.set(result.payload.address);
				loadConnectedAccountData();
				setIsLoadingWallet(false);
				openPage($router, "send");
			} else {
				// re-enable button for user
				setIsLoadingWallet(false);
				// todo: prompt them to try again
			}
		});
	};

	return (
		<div>
			<h4>{t("slogan")}</h4>
			<div class="mt-5 mb-5">
				<div class="select">
					<select
						title={connectedAccountPath()}
						onChange={onChangeAddressPath}
					>
						<For each={TezosAddressPaths}>
							{(path, pathIndex) => <option value={path}
																						title={path}>{startCase(t("address"))} {pathIndex() + 1}</option>}
						</For>
					</select>
				</div>
			</div>
			<button
				classList={{
					"button": true,
					"is-primary": true,
					"is-large": true,
					"is-loading": isLoadingWallet()
				}}
				disabled={isLoadingWallet()}
				onClick={getAddress}
			>
				{t("connect_trezor")}*
			</button>
			<p class="mt-4">*{t("connect_trezor_footnote")}</p>
		</div>
	);
};

/**
 * Private
 *
 */

function onChangeAddressPath(event: Event) {
	const target = event.target as HTMLSelectElement;
	$connectedAccountPath.set(target.value);
}


