import * as Tezos from "trezor-connect/lib/typescript/networks/tezos";
import * as P from "trezor-connect/lib/typescript/params";

export default {
	init: (settings: { manifest: P.Manifest } & Partial<P.ConnectSettings>) =>
		settings,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	tezosGetAddress: jest.fn().mockResolvedValue({
		success: false,
		payload: {
			error: "Implement if needed.",
		},
	}),
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	tezosGetPublicKey: jest.fn().mockResolvedValue({
		success: false,
		payload: {
			error: "Implement if needed.",
		},
	}),
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	tezosSignTransaction: jest.fn().mockResolvedValue({
		success: false,
		payload: {
			error: "Implement if needed.",
		},
	}),
};
