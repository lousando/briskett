<template>
	<main>
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
});
</script>

<style lang="postcss">
@import "bulma/css/bulma.min.css";

main {
	display: grid;
	grid-template-rows: auto 1fr;
}

section {
	text-align: center;
}

footer {
	text-align: right;
}
</style>
