import exp from "constants";
import { render, fireEvent } from "@testing-library/vue";
import Chance from "chance";
import { RpcClient } from "@taquito/rpc";
import TrezorConnect from "trezor-connect";
// @ts-ignore
import Delegate from "~/pages/delegate";
import { state } from "~/store";

const chance = Chance();

jest.mock("@taquito/rpc");

describe("Delegate Page", () => {
	it("fails to delegate when baker address is left empty.", async () => {
		const { getByText } = render(Delegate, {
			store: {
				state: {
					...state(),
					connectedAddress: chance.hash(),
				},
			},
		});

		await fireEvent.click(getByText("Delegate"));
		expect(getByText("Please enter a baker address")).toBeTruthy();
	});

	it("prompts the user for the reveal their public key and shows error when rejected", async () => {
		const { getByPlaceholderText, getByText } = render(Delegate, {
			store: {
				state: {
					...state(),
					connectedAddress: chance.hash(),
				},
			},
		});

		// @ts-ignore
		RpcClient.mockImplementation(() => {
			return {
				...RpcClient,
				getBlockHeader: jest.fn().mockResolvedValue(chance.hash()),
			};
		});

		await fireEvent.update(
			getByPlaceholderText("baker address"),
			chance.hash()
		);

		// @ts-ignore
		TrezorConnect.tezosGetPublicKey.mockResolvedValue({
			success: false,
		});

		await fireEvent.click(getByText("Delegate"));
		expect(() => getByText("Prompting for public key...")).toBeTruthy();
		expect(() =>
			getByText("Failed to get public key. Please try again.")
		).toBeTruthy();
	});
});
