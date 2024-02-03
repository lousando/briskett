export const XTZ_SCALAR: number = 1000000;

export class ReadOnlySigner {
	constructor(private pkh: string, private pk: string) {
	}

	async publicKeyHash() {
		return this.pkh;
	}

	async publicKey() {
		return this.pk;
	}

	async secretKey(): Promise<string> {
		throw new Error("Secret key cannot be exposed");
	}

	async sign(): Promise<{
		bytes: string;
		sig: string;
		prefixSig: string;
		sbytes: string;
	}> {
		throw new Error("Cannot sign");
	}
}

export function startCase(str: string): string {
	return str.toLowerCase().replace(/(^|\s)\S/g, function (firstLetter) {
		return firstLetter.toUpperCase();
	});
}

export async function getBlockHeadHash(): Promise<string> {
	return await fetch(
		`${import.meta.env.PUBLIC_TAQUITO_RPC_URL}/chains/main/blocks/head/hash`,
	).then((r) => r.json());
}

export async function getAccountRevelation(address: string): Promise<boolean> {
	const managerKey: null | string = await fetch(
		`${
			import.meta.env.PUBLIC_TAQUITO_RPC_URL
		}/chains/main/blocks/head/context/contracts/${address}/manager_key`,
	).then((r) => r.json());

	return managerKey !== null;
}

export async function getContract(address: string): Promise<Contract> {
	const contract: RawContract = await fetch(
		`${
			import.meta.env.PUBLIC_TAQUITO_RPC_URL
		}/chains/main/blocks/head/context/contracts/${address}`,
	).then((r) => r.json());

	const balanceInMutez = Number.parseInt(contract.balance);
	const balanceInTez = balanceInMutez / XTZ_SCALAR;

	return {
		balance: Number.isNaN(balanceInTez) ? 0.0 : balanceInTez,
		delegate: contract.delegate ?? "",
		counter: Number.parseInt(contract.counter),
	};
}

export async function getChainID(): Promise<string> {
	return await fetch(
		`${import.meta.env.PUBLIC_TAQUITO_RPC_URL}/chains/main/chain_id`,
	).then((r) => r.json());
}

export async function getFeeEstimate(
	sourceAddress: string,
	destinationAddress: string,
	amountInTez: number,
): Promise<RunOperationInfo> {
	const [headHash, contract, chainID] = await Promise.all([
		getBlockHeadHash(),
		getContract(sourceAddress),
		getChainID(),
	]);

	return await fetch(
		`${
			import.meta.env.PUBLIC_TAQUITO_RPC_URL
		}/chains/main/blocks/head/helpers/scripts/run_operation`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				operation: {
					branch: headHash,
					contents: [
						{
							kind: "transaction",
							fee: "1",
							gas_limit: "1040000", // todo: figure out how to get this
							storage_limit: "60000", // todo: figure out how to get this
							amount: String(amountInTez * XTZ_SCALAR),
							destination: destinationAddress,
							source: sourceAddress,
							counter: String(contract.counter + 1),
						},
					],
					// todo: figure out how to generate a fake signature each time
					signature:
						"edsigtXomBKi5CTRf5cjATJWSyaRvhfYNHqSUGrn4SdbYRcGwQrUGjzEfQDTuqHhuA8b2d8NarZjz8TRf65WkpQmo423BtomS8Q",
				},
				chain_id: chainID,
			}),
		},
	).then((r) => r.json());
}

/*
 * Responds with a TX ID
 */
export async function injectSignedOperation(
	signedOperationContents: string,
): Promise<string> {
	return await fetch(
		`${import.meta.env.PUBLIC_TAQUITO_RPC_URL}/injection/operation`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(signedOperationContents),
		},
	).then((r) => r.json());
}
