<template>
	<main>
		<header>
			<h1 class="is-size-1">Briskett <sub>[beta]</sub></h1>

			<h4 v-if="this.$store.state.connectedAddress" class="is-size-4">
				Connected Address: {{ this.$store.state.connectedAddress }}
			</h4>
			<h4 v-if="this.$store.state.connectedAddress" class="balance is-size-4">
				Balance: {{ this.$store.state.connectedAddressBalance }}
			</h4>
			<h5 v-if="this.$store.state.connectedAddressBaker">
				Baker:
				<a
					rel="noopener"
					target="_blank"
					:href="`https://tzstats.com/${this.$store.state.connectedAddressBaker}`"
					>{{ this.$store.state.connectedAddressBaker }}</a
				>
			</h5>

			<div v-if="this.$store.state.connectedAddress" class="tabs">
				<ul>
					<li>
						<NuxtLink to="/send">Send</NuxtLink>
					</li>
					<li>
						<!--						<NuxtLink to="/delegate">Delegate</NuxtLink>-->
					</li>
					<li>
						<!--						<NuxtLink to="/receive">Receive</NuxtLink>-->
					</li>
				</ul>
			</div>
		</header>
		<section>
			<Nuxt />
		</section>
		<footer class="is-size-7">Version: {{ version }}</footer>
	</main>
</template>

<script>
import Vue from "vue";
import { version } from "../package.json";

export default Vue.extend({
	data() {
		return {
			version,
		};
	},
	mounted() {
		// start from index each time
		this.$nuxt.$router.push("/");

		setInterval(() => {
			if (this.$store.state.connectedAddress) {
				this.$store.dispatch("loadConnectedAccountData");
			}
		}, 1000 * 30 /* check once every 30 seconds */);
	},
});
</script>

<style lang="postcss">
@import "bulma/css/bulma.min.css";

main {
	display: grid;
	grid-template-rows: 1fr auto 1fr;
}

header,
section {
	text-align: center;
}

a.nuxt-link-active {
	border-bottom: 3px solid gray;
}

footer {
	text-align: right;
}

.balance::after {
	content: "ꜩ";
}

form {
	text-align: left;
	margin: 30px;
}

.control {
	width: 100%;
}
</style>
