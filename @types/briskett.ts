interface Operation {
	id: number;
	hash: string;
	type: "reveal" | "delegation" | "transaction";
	block: string;
	time: string;
	height: number;
	cycle: number;
	counter: number;
	op_n: number;
	op_p: number;
	status: string;
	is_success: boolean;
	gas_limit: number;
	gas_used: number;
	amount: number;
	sender: {
		address: string;
	}
	target: {
		address: string;
	};
	baker: string;
	confirmations: number;
}

interface RawContract {
	balance: string; // in Mutez
	delegate?: string; // an address
	counter: string;
}

interface Contract {
	balance: number; // in Tez
	delegate: string; // an address
	counter: number;
}

interface RunOperationInfo {
	contents: {
		kind: string;
		source: string;
		fee: string;
		counter: string;
		gas_limit: string;
		storage_limit: string;
		amount: string;
		destination: string;
		metadata: {
			balance_updates: {
				kind: string;
				contract: string;
				change: string;
				origin: string;
			}[];
			operation_result: {
				status: string;
				balance_updates: {
					kind: string;
					contract: string;
					change: string;
					origin: string;
				}[];
				consumed_milligas: string;
			};
		};
	}[];
	signature: string;
}
