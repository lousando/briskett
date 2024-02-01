import { atom } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

export const $rpcNodeOnline = atom<boolean>(false);

export const $tzProKey = persistentAtom<string>("tz_pro_api_key", "");
export const $tzProApiOnline = atom<boolean>(false);
