import dayjs from "dayjs";

interface AppState {
	connectedAccountPath: string;
	connectedAddress: string;
	connectedAddressBalance: number;
	connectedAccountOperations: Array<Object>;
	connectedAddressBaker: string;
	connectedAccountIsRevealed: boolean;
}

export const state = (): AppState => ({
	connectedAccountPath: "m/44'/1729'/0'",
	connectedAddress: "",
	connectedAddressBalance: 0.0,
	connectedAccountOperations: [],
	connectedAddressBaker: "",
	connectedAccountIsRevealed: false,
});

export const getters = {};

export const mutations = {
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
			`https://api.tzstats.com/explorer/account/${context.state.connectedAddress}`
		)
			.then((r) => r.json())
			.then(
				(payload: {
					total_balance: string;
					delegate: string;
					is_revealed: boolean;
				}) => {
					context.commit(
						"setConnectedAddressBalance",
						Number(payload?.total_balance)
					);
					context.commit("setConnectedAddressBaker", payload.delegate);
					context.commit("setConnectedAccountIsRevealed", payload.is_revealed);
				}
			);

		fetch(
			`https://api.tzstats.com/explorer/account/${context.state.connectedAddress}/operations?order=desc`
		)
			.then((r) => r.json())
			.then((payload) => {
				interface AccountOperations {
					time: string;
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
