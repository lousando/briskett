import dayjs from "dayjs";
import TezosAddressPaths from "~/assets/js/tezosAddressPaths";

interface AppState {
	connectedAccountPath: string;
	connectedAddress: string;
	connectedAddressBalance: number;
	connectedAccountOperations: Array<Object>;
	connectedAddressBaker: string;
	connectedAccountIsRevealed: boolean;
}

export const state = (): AppState => ({
	connectedAccountPath: TezosAddressPaths[0], // default to first path
	connectedAddress: "",
	connectedAddressBalance: 0.0,
	connectedAccountOperations: [],
	connectedAddressBaker: "",
	connectedAccountIsRevealed: false,
});

export const getters = {};

export const mutations = {
	setConnectedAccountPath(state: AppState, payload: string) {
		state.connectedAccountPath = payload;
	},
	setConnectedAddress(state: AppState, payload: string) {
		state.connectedAddress = payload;
	},
	setConnectedAddressBalance(state: AppState, payload: number) {
		state.connectedAddressBalance = payload;
	},
	setConnectedAccountOperations(state: AppState, payload: Array<Object>) {
		state.connectedAccountOperations = payload;
	},
	setConnectedAddressBaker(state: AppState, payload: string) {
		state.connectedAddressBaker = payload;
	},
	setConnectedAccountIsRevealed(state: AppState, payload: boolean) {
		state.connectedAccountIsRevealed = payload;
	},
};

export const actions = {
	loadConnectedAccountData(context: any) {
		fetch(
			`${process.env.NUXT_ENV_TZSTATS_URL}/explorer/account/${context.state.connectedAddress}`
		)
			.then((r) => r.json())
			.then(
				(payload: {
					total_balance: string;
					delegate: string;
					is_revealed: boolean;
				}) => {
					if (
						payload?.total_balance === undefined ||
						Number.isNaN(payload.total_balance)
					) {
						context.commit("setConnectedAddressBalance", Number(0.0));
					} else {
						context.commit(
							"setConnectedAddressBalance",
							Number(payload?.total_balance)
						);
					}

					context.commit("setConnectedAddressBaker", payload.delegate);
					context.commit("setConnectedAccountIsRevealed", payload.is_revealed);
				}
			);

		fetch(
			`${process.env.NUXT_ENV_TZSTATS_URL}/explorer/account/${context.state.connectedAddress}/operations?order=desc`
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
							time: dayjs(operation?.time).format("ddd, MMM DD, YYYY HH:mm:ss"),
						};
					}
				);

				context.commit("setConnectedAccountOperations", formattedOperations);
			});
	},
};
