<template>
	<main>
		<header>
			<h1 class="is-size-1">Briskett 🥩<sub>[beta]</sub></h1>

			<h3 v-if="this.$store.state.connectedAddress" class="balance is-size-3">
				Balance: {{ this.$store.state.connectedAddressBalance }}
			</h3>
			<h4 v-if="this.$store.state.connectedAddress" class="is-size-4">
				Address: {{ this.$store.state.connectedAddress }}
			</h4>
			<h4 v-if="this.$store.state.connectedAddressBaker" class="is-size-4">
				Baker:
				<a
					rel="noopener"
					target="_blank"
					:href="`https://tzstats.com/${this.$store.state.connectedAddressBaker}`"
					>{{ this.$store.state.connectedAddressBaker }}</a
				>
			</h4>

			<div v-if="this.$store.state.connectedAddress" class="tabs is-centered">
				<ul>
					<li>
						<NuxtLink to="/send">Send</NuxtLink>
					</li>
					<li>
						<NuxtLink to="/delegate">Delegate</NuxtLink>
					</li>
					<li>
						<NuxtLink to="/receive">Receive</NuxtLink>
					</li>
				</ul>
			</div>
		</header>
		<section>
			<Nuxt />
		</section>
		<section
			v-if="this.$store.state.connectedAccountOperations.length > 0"
			class="operations"
		>
			<h3 class="is-size-3">
				Last
				{{
					this.$store.state.connectedAccountOperations.length > 1
						? `${this.$store.state.connectedAccountOperations.length} Operations`
						: "Operation"
				}}
			</h3>
			<div
				v-for="(operation, operationIndex) in this.$store.state
					.connectedAccountOperations"
				:key="operation.hash + '_' + operation.type"
				class="operation"
			>
				<div v-if="operationIndex === 0" class="header">Hash</div>
				<div v-if="operationIndex === 0" class="header">Time</div>
				<div v-if="operationIndex === 0" class="header">Type</div>
				<div v-if="operationIndex === 0" class="header">From</div>
				<div v-if="operationIndex === 0" class="header">Amount</div>
				<a
					rel="noopener"
					target="_blank"
					:href="`https://tzstats.com/${operation.hash}`"
					>{{ operation.hash.slice(0, 5) }}...{{ operation.hash.slice(-5) }}</a
				>
				<div>{{ operation.time }}</div>
				<div>{{ operation.type }}</div>
				<a
					rel="noopener"
					target="_blank"
					:href="`https://tzstats.com/${operation.sender}`"
					>{{ operation.sender.slice(0, 5) }}...{{
						operation.sender.slice(-5)
					}}</a
				>
				<div class="amount">{{ operation.volume }}</div>
			</div>
		</section>
		<footer class="is-size-7">
			<div class="left">
				<div>
					Mainnet Giga Node Status:&nbsp;
					<span
						:class="{
							'node-status': true,
							'node-status--online': this.rpcNodeOnline === true,
							'node-status--offline': this.rpcNodeOnline === false,
						}"
						>{{ this.rpcNodeOnline ? "ONLINE" : "OFFLINE" }}</span
					>
				</div>
				<div>
					TzStats API Status:&nbsp;
					<span
						:class="{
							'node-status': true,
							'node-status--online': this.tzStatsApiOnline === true,
							'node-status--offline': this.tzStatsApiOnline === false,
						}"
						>{{ this.tzStatsApiOnline ? "ONLINE" : "OFFLINE" }}</span
					>
				</div>
			</div>
			<div class="right">
				<a
					href="https://github.com/lousando/briskett"
					rel="noopener"
					target="_blank"
				>
					<svg
						aria-hidden="true"
						focusable="false"
						data-prefix="fab"
						data-icon="github"
						role="img"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 496 512"
						width="20"
					>
						<path
							fill="black"
							d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
						></path>
					</svg>
				</a>
				<div>Version: {{ version }}</div>
				<div>
					<a href="https://fontawesome.com/" rel="noopener" target="_blank">
						Icons from Font Awesome
					</a>
				</div>
				<div>Donations: tz1Sx6bVpeRCQGzmHMCH63AYJ8NcJGswi2sa</div>
			</div>
		</footer>
	</main>
</template>

<script>
import Vue from "vue";
import { version } from "../package.json";

export default Vue.extend({
	data() {
		return {
			version,
			rpcNodeOnline: false,
			tzStatsApiOnline: false,
		};
	},
	mounted() {
		// start from index each time
		this.$nuxt.$router.push("/");

		const checkNodeStatuses = () => {
			fetch(
				`${process.env.NUXT_ENV_TAQUITO_RPC_URL}/chains/main/blocks/head/hash`
			)
				.then((r) => {
					if (r.ok) {
						this.rpcNodeOnline = true;
					} else {
						this.rpcNodeOnline = false;
					}
				})
				.catch(() => {
					this.rpcNodeOnline = false;
				});

			fetch("https://api.tzstats.com/explorer/tip")
				.then((r) => {
					if (r.ok) {
						this.tzStatsApiOnline = true;
					} else {
						this.tzStatsApiOnline = false;
					}
				})
				.catch(() => {
					this.tzStatsApiOnline = false;
				});
		};

		checkNodeStatuses();

		setInterval(checkNodeStatuses, 1000 * 60 /* check once every minute */);

		setInterval(() => {
			if (this.$store.state.connectedAddress) {
				this.$store.dispatch("loadConnectedAccountData");
			}
		}, 1000 * 30 /* check once every 30 seconds */);
	},
});
</script>

<style lang="scss">
@import "~bulma";

:root {
	--primary-color: #bf3d40;
	--secondary-color: #ca7d7e;
	--tertiary-color: #401415;
	--link-color: #8c2d2e;
	--border-radius: 20px;
}

main {
	display: grid;
	grid-template-rows: 1fr auto auto 1fr;
}

header,
section {
	text-align: center;
	width: min(800px, 80vw);
	margin: 30px auto 0 auto;
}

.balance::after {
	content: "ꜩ";
}

section {
	margin: 30px auto;
	padding: 40px 50px 80px 50px;
	border-radius: var(--border-radius);
	box-shadow: 3px 3px 10px var(--primary-color);
}

.operations {
	.header {
		border-bottom: 1px solid $grey-light;
	}

	.operation {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 2%;
		margin-bottom: 10px;

		> a {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.amount::after {
			content: "ꜩ";
		}
	}
}

a {
	color: var(--link-color);
}

a[target="_blank"] {
	path {
		fill: var(--link-color);
	}

	svg:hover {
		path {
			fill: $grey-darker;
		}
	}

	&:hover {
		&::after {
			background-color: $grey-darker;
		}
	}

	&::after {
		content: "";
		display: inline-block;
		transform: translateY(-0.5px);
		mask-image: url("/icons/external-link-alt-solid.svg");
		mask-repeat: no-repeat;
		mask-position: center;
		mask-size: auto;
		width: 0.7em;
		height: 0.7em;
		margin-left: 2px;
		background-color: var(--link-color);
	}
}

.notification:not(.is-success, .is-danger) {
	background-color: transparent;
	border: 2px solid var(--primary-color);
	border-radius: calc(var(--border-radius) / 2);
}

@keyframes drop-shadow {
	0% {
		box-shadow: 0 0 0 0 black;
	}
	100% {
		box-shadow: 2px 2px 5px black;
	}
}

.button.is-primary {
	background-color: var(--primary-color);
	color: white;
}

.button.is-primary:hover {
	background-color: var(--primary-color);
	animation: drop-shadow 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.button.is-primary:focus {
	background-color: var(--primary-color);
}

.button.is-primary.is-loading {
	background-color: var(--primary-color);
}

a.nuxt-link-active {
	border-bottom: 3px solid var(--primary-color);
}

.tabs a:hover {
	border-bottom: 3px solid var(--secondary-color);
}

form {
	margin-bottom: 10px;
}

@keyframes expand {
	0% {
		opacity: 0;
		transform: translatey(-15px);
	}
	100% {
		opacity: 1;
		transform: translatey(0);
	}
}

details[open] p {
	animation: expand 200ms linear;
}

summary {
	margin-top: 10px;
	cursor: pointer;
	user-select: none;
}

footer {
	display: flex;
	justify-content: space-between;

	@media (max-width: $tablet) {
		flex-direction: column;
		gap: 20px;
	}

	.node-status {
		&--online {
			color: $green;
		}

		&--offline {
			color: $red;
		}
	}

	.left {
		text-align: left;
		margin-left: 20px;

		@media (max-width: $tablet) {
			text-align: center;
			margin: 0;
		}
	}

	.right {
		text-align: right;
		margin-right: 20px;

		@media (max-width: $tablet) {
			text-align: center;
			margin: 0;
		}
	}
}
</style>
