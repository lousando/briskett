import { $router } from "../assets/js/router.ts";
// page components
import ConnectionMenu from "../components/connectionMenu.tsx";
import { t } from "../assets/js/i18n.ts";
import { createSignal, ErrorBoundary, lazy, Match, onMount, Switch } from "solid-js";


export default function Router() {
	const [route, setRoute] = createSignal<string>($router.get()?.route ?? "home");
	const LazySend = lazy(() => import("./send.jsx"));
	const LazyDelegate = lazy(() => import("./delegate.tsx"));
	const LazyReceive = lazy(() => import("./receive.tsx"));

	onMount(() => {
		$router.listen((r) => {
			setRoute(r?.route || "home");
		});
	});

	const FallbackMessage = () => <p>{t("something_went_wrong")}</p>;

	return <Switch>
		<Match when={route() === "home"}>
			<ErrorBoundary fallback={FallbackMessage}>
				<ConnectionMenu />
			</ErrorBoundary>
		</Match>
		<Match when={route() === "send"}>
			<ErrorBoundary fallback={FallbackMessage}>
				<LazySend />
			</ErrorBoundary>
		</Match>
		<Match when={route() === "delegate"}>
			<ErrorBoundary fallback={FallbackMessage}>
				<LazyDelegate />
			</ErrorBoundary>
		</Match>
		<Match when={route() === "receive"}>
			<ErrorBoundary fallback={FallbackMessage}>
				<LazyReceive />
			</ErrorBoundary>
		</Match>
	</Switch>;
}
