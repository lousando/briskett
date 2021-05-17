import { render, fireEvent } from "@testing-library/vue";
import Chance from "chance";
import TrezorConnect from "trezor-connect";
// @ts-ignore
import Receive from "~/pages/receive";
import { state } from "~/store";
const chance = Chance();

describe("Receive Page", () => {
	it("can display the current account address", () => {
		const randomConnectedAddress: string = chance.hash();

		const { getByLabelText } = render(Receive, {
			store: {
				state: {
					...state(),
					connectedAddress: randomConnectedAddress,
				},
			},
		});

		// @ts-ignore
		expect(getByLabelText("connected account address").value).toEqual(
			randomConnectedAddress
		);
	});

	it("can verify the current account address by reaching out to the Trezor", async () => {
		const randomConnectedAddress: string = chance.hash();

		const { getByText } = render(Receive, {
			store: {
				state: {
					...state(),
					connectedAddress: randomConnectedAddress,
				},
			},
		});

		await fireEvent.click(getByText("Verify Address"));

		// @ts-ignore
		expect(TrezorConnect.tezosGetAddress).toHaveBeenCalled();
	});
});
