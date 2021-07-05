import Vue from "vue";

const TUtils = {
	install: (Vue) => {
		Vue.prototype.$tCap = function (path = "") {
			const translation = this.$t(path);
			return translation[0].toLocaleUpperCase() + translation.slice(1);
		};

		Vue.prototype.$tUpper = function (path = "") {
			return this.$t(path)?.toLocaleUpperCase();
		};

		Vue.prototype.$tLower = function (path = "") {
			return this.$t(path)?.toLocaleLowerCase();
		};
	},
};

Vue.use(TUtils);
