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
	volume: number;
	fee: number;
	sender: string;
	receiver: string;
	baker: string;
	confirmations: number;
}
