import { createRouter } from "@nanostores/router";

export const $router = createRouter({
	home: "/",
	send: "/send",
	delegate: "/delegate",
	undelegate: "/undelegate",
	receive: "/receive"
});
