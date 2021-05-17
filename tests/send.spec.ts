import { render, fireEvent, getByLabelText } from "@testing-library/vue";
// @ts-ignore
import Send from "@/pages/send";
import Chance from "chance";
import TrezorConnect from "trezor-connect";
import { state } from "~/store";

const chance = new Chance();

describe("Send Page", function () {
	it("does not submit the form if no destination address is provided", async () => {
		const { debug, getByText, getByPlaceholderText } = render(Send, {
			store: {
				state: {
					...state(),
					connectedAddress: chance.hash(),
				},
			},
		});

		// @ts-ignore
		expect(getByPlaceholderText("destination address").value).toEqual("");

		await fireEvent.click(getByText("Send"));

		expect(getByText("Please provide a destination address.")).toBeTruthy();
	});

	it("does not submit the form if amount is zero or negative", async () => {
		const { container, getByText, getByPlaceholderText } = render(Send, {
			store: {
				state: {
					...state(),
					connectedAddress: chance.hash(),
				},
			},
		});

		await fireEvent.update(
			getByPlaceholderText("destination address"),
			"tz1xxx"
		);

		// @ts-ignore
		const amountElement = getByLabelText(container, "Amount");

		// @ts-ignore
		await fireEvent.update(
			amountElement,
			chance.floating({ min: -100, max: 0, fixed: 7 })
		);

		await fireEvent.click(getByText("Send"));

		expect(getByText("Please provide an amount.")).toBeTruthy();
	});

	it("prompts for a public key when it hasn't been revealed on the address and shows an error when rejected.", async () => {
		const { container, getByText, getByPlaceholderText } = render(Send, {
			store: {
				state: {
					...state(),
					connectedAddress: chance.hash(),
					connectedAccountIsRevealed: false,
				},
			},
		});

		await fireEvent.update(
			getByPlaceholderText("destination address"),
			"tz1xxx"
		);

		// @ts-ignore
		const amountElement = getByLabelText(container, "Amount");

		// @ts-ignore
		await fireEvent.update(
			amountElement,
			chance.floating({ min: 1, max: 100, fixed: 7 })
		);

		// @ts-ignore
		TrezorConnect.tezosGetPublicKey.mockResolvedValue({
			success: false,
		});

		await fireEvent.click(getByText("Send"));

		expect(() => getByText("Prompting for public key...")).toBeTruthy();
		expect(() =>
			getByText("Failed to get public key. Please try again.")
		).toBeTruthy();
	});
});
