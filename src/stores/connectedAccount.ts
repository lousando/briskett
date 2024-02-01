import { atom } from "nanostores";
import dayjs from "dayjs";
import TezosAddressPaths from "../assets/js/tezosAddressPaths.ts";
import { $tzProKey } from "../stores/externalServices.ts";

// default to first path
export const $connectedAccountPath = atom<string>(TezosAddressPaths[0]);
export const $connectedAddress = atom<string>(import.meta.env.PUBLIC_INITIAL_CONNECTED_ADDRESS || "");
export const $connectedAddressBalance = atom<number>(0.0);
export const $connectedAccountOperations = atom<Array<Object>>([]);
export const $connectedAddressBaker = atom<string>("");
export const $connectedAccountIsRevealed = atom<boolean>(false);


export function loadConnectedAccountData() {
	fetch(
		`${import.meta.env.PUBLIC_TZPRO_URL}/explorer/account/${$connectedAddress.get()}`, {
			headers: {
				"X-API-Key": $tzProKey.get() || import.meta.env.PUBLIC_TZPRO_API_KEY
			}
		}
	)
		.then((r) => r.json())
		.then(
			(payload: {
				spendable_balance: string;
				baker: string;
				is_revealed: boolean;
			}) => {
				if (
					payload?.spendable_balance === undefined ||
					Number.isNaN(payload.spendable_balance)
				) {
					$connectedAddressBalance.set(0.0);
				} else {
					$connectedAddressBalance.set(Number(payload?.spendable_balance));
				}

				$connectedAddressBaker.set(payload?.baker);
				$connectedAccountIsRevealed.set(payload?.is_revealed);
			}
		);

	fetch(
		`${import.meta.env.PUBLIC_TZPRO_URL}/explorer/account/${$connectedAddress.get()}/operations?order=desc`, {
			headers: {
				"X-API-Key": $tzProKey.get() || import.meta.env.PUBLIC_TZPRO_API_KEY
			}
		}
	)
		.then((r) => r.json())
		.then((payload) => {
			interface AccountOperations {
				time: string;
			}

			if (Object.hasOwnProperty.call(payload, "errors")) {
				return;
			}

			const formattedOperations: Array<Object> = payload.map(
				(operation: AccountOperations) => {
					return {
						...operation,
						time: dayjs(operation?.time).format("ddd, MMM DD, YYYY HH:mm:ss")
					};
				}
			);

			$connectedAccountOperations.set(formattedOperations);
		});
}
