import { render, fireEvent } from "@testing-library/vue";
import TrezorConnect from "@trezor/connect-web";
import Chance from "chance";
// @ts-ignore
import Index from "~/pages/index";
import { state } from "~/store";

const chance = Chance();

describe("Index Page", () => {
	afterEach(() => {
		// @ts-ignore
		TrezorConnect.tezosGetAddress.mockClear();
	});

	it("prompts the user to connect their Trezor when there is no connected address.", () => {
		const { getByText } = render(Index, {
			store: {
				state: state(),
			},
		});

		expect(getByText("Connect Trezor*")).toBeTruthy();
	});

	it("prompts the user to export their address on 'Connect Trezor' button click", async () => {
		const { getByText } = render(Index, {
			store: {
				state: state(),
			},
		});

		// @ts-ignore
		TrezorConnect.tezosGetAddress.mockResolvedValue({
			success: false,
		});

		await fireEvent.click(getByText("Connect Trezor*"));

		expect(TrezorConnect.tezosGetAddress).toHaveBeenCalledTimes(1);
	});

	it("redirects the user to the send page on successful public address export", async () => {
		const mockSetConnectedAddress = jest.fn();
		const mockLoadConnectedAccountData = jest.fn();

		const { getByText } = render(Index, {
			store: {
				state: state(),
				mutations: {
					setConnectedAddress: mockSetConnectedAddress,
				},
				actions: {
					loadConnectedAccountData: mockLoadConnectedAccountData,
				},
			},
		});

		const fakeTezosAddress = chance.hash();

		// @ts-ignore
		TrezorConnect.tezosGetAddress.mockResolvedValue({
			success: true,
			payload: {
				address: fakeTezosAddress,
			},
		});

		await fireEvent.click(getByText("Connect Trezor*"));

		expect(TrezorConnect.tezosGetAddress).toHaveBeenCalledTimes(1);
		expect(mockSetConnectedAddress).toHaveBeenCalledTimes(1);
		expect(mockLoadConnectedAccountData).toHaveBeenCalledTimes(1);
	});
});
