import Vue from "vue";

export default Vue.extend({
	name: "VueQrcode",
	props: ["value", "options"],
	template: `<div>QR Code Mock</div>`,
});
