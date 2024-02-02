import { $router } from "../assets/js/router.ts";
// page components
import ConnectionMenu from "../components/connectionMenu.tsx";
import { createSignal, lazy, Match, onMount, Switch } from "solid-js";


export default function Router() {
	const [route, setRoute] = createSignal<string>($router.get()?.route ?? "home");
	const LazySend = lazy(() => import("../components/send.jsx"));
	const LazyDelegate = lazy(() => import("../components/delegate.tsx"));
	const LazyReceive = lazy(() => import("./receive.tsx"));

	onMount(() => {
		$router.listen((r) => {
			setRoute(r?.route || "home");
		});
	});

	return <Switch>
		<Match when={route() === "home"}>
			<ConnectionMenu />
		</Match>
		<Match when={route() === "send"}>
			<LazySend />
		</Match>
		<Match when={route() === "delegate"}>
			<LazyDelegate />
		</Match>
		<Match when={route() === "receive"}>
			<LazyReceive />
		</Match>
	</Switch>;
}
