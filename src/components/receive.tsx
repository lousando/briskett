import { createEffect, onMount } from "solid-js";
import TrezorConnect from "@trezor/connect-web";
import tippy from "tippy.js";
import { $connectedAccountPath, $connectedAddress } from "../stores/connectedAccount.ts";
import { t } from "../assets/js/i18n.ts";
import { useStore } from "@nanostores/solid";
import QRCode from "qrcode";

export default function Receive() {
	// global state
	const connectedAddress = useStore($connectedAddress);

	onMount(() => {
		tippy("#receiveAddress", {
			content: "Copied!",
			trigger: "click"
		});
	});

	createEffect(() => {
		const canvas = document.getElementById("canvas");
		QRCode.toCanvas(canvas, connectedAddress(), { errorCorrectionLevel: "H", width: 300 });
	});

	const copyAddress = ({ target }) => {
		target.select();
		navigator.clipboard.writeText($connectedAddress.get());
	};

	const verifyAddress = () => {
		TrezorConnect.tezosGetAddress({
			path: $connectedAccountPath.get(),
			showOnTrezor: true
		});
	};

	return <div>
		<canvas id="canvas"></canvas>
		<div class="field">
			<div class="control">
				<input
					id="receiveAddress"
					type="text"
					class="input has-text-centered"
					aria-label="connected account address"
					value={connectedAddress()}
					readonly
					onClick={copyAddress}
				/>
			</div>
		</div>
		<button class="button is-primary" onClick={verifyAddress}>
			{t("verify_address")}
		</button>
		<details>
			<summary>{t("why_verify_my_address")}</summary>
			<p>
				{t("why_verify_my_address_answer")}
			</p>
		</details>
	</div>;
}
