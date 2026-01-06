import { useStore } from "@nanostores/solid";
import { t } from "../assets/js/i18n.ts";
import { $rpcNodeOnline, $tzProApiOnline } from "../stores/externalServices.ts";
import { startCase } from "../assets/js/util.ts";
import { Match, Switch } from "solid-js";
import { $settingsModalIsShown } from "../stores/settingsModal.ts";

export default function Footer() {
	const rpcNodeOnline = useStore($rpcNodeOnline);
	const tzStatsApiOnline = useStore($tzProApiOnline);

	return (
		<footer class="is-size-6">
			<div class="left">
				<div class="node-status-container">
					{t("rpc_node_status")}:&nbsp;
					<span
						classList={{
							"node-status": true,
							"node-status--online": rpcNodeOnline(),
							"node-status--offline": !rpcNodeOnline(),
						}}
					>
						<Switch>
							<Match when={rpcNodeOnline()}>
								{t("online")?.toLocaleUpperCase()}
							</Match>
							<Match when={!rpcNodeOnline()}>
								{t("offline").toLocaleUpperCase()}
							</Match>
						</Switch>
					</span>
				</div>
				<div class="node-status-container">
					{t("tzstats_api_status")}:&nbsp;
					<span
						classList={{
							"node-status": true,
							"node-status--online": tzStatsApiOnline(),
							"node-status--offline": !tzStatsApiOnline(),
						}}
					>
						<Switch>
							<Match when={tzStatsApiOnline()}>
								{t("online")?.toLocaleUpperCase()}
							</Match>
							<Match when={!tzStatsApiOnline()}>
								{t("offline")?.toLocaleUpperCase()}
								<button
									type="button"
									class="button is-small is-danger ml-1"
									onClick={() => $settingsModalIsShown.set(true)}
								>
									{t("tzpro_api_key_click_to_add_own_key")}
								</button>
							</Match>
						</Switch>
					</span>
					<div>
						<a href="https://tzkt.io/" target="_blank">{t("tx_log_api_attribution")}</a>
					</div>
				</div>
			</div>
			<div class="right">
				{/*	 Find something for this corner */}
			</div>
		</footer>
	);
}
