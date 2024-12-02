import { createSignal, For, onMount, Show } from "solid-js";
import {
	availableLocales,
	currentLocale,
	setCurrentLocale,
	t,
} from "../../assets/js/i18n.ts";
import { $tzProKey } from "../../stores/externalServices.ts";
import localeEmoji from "locale-emoji";
import { $settingsModalIsShown } from "../../stores/settingsModal.ts";
import { useStore } from "@nanostores/solid";
import "./settingsCorner.scss";
import { version } from "../../../package.json";
import { startCase } from "../../assets/js/util.ts";

export default function SettingsCorner() {
	const showModal = useStore($settingsModalIsShown);
	const [tempTzProKey, setTempTzProKey] = createSignal<string>($tzProKey.get());

	onMount(() => {
		// change to the current local on init
		setCurrentLocale(navigator.language);
	});

	return (
		<form
			class="settings-corner"
			onSubmit={(event) => {
				event.preventDefault();

				$tzProKey.set(tempTzProKey());

				$settingsModalIsShown.set(false);
				location.reload();
			}}
		>
			<div class="is-flex is-align-content-center">
				<span class="mr-1">v{version}</span>
				<span>
						<a
							href="https://github.com/lousando/briskett"
							rel="noopener"
							target="_blank"
						>
							<svg
								aria-hidden="true"
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
					</span>
			</div>
			<div
				class="additional-settings-button"
				onClick={() => $settingsModalIsShown.set(!$settingsModalIsShown.get())}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512 512"
					width="1.2rem"
				>
					<path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
				</svg>

			</div>
			{/* donation section */}
			<div class="is-flex is-flex-direction-column is-align-items-end">
				<Show when={import.meta.env.PUBLIC_DONATION_KOFI_LINK}>
					<img src="/images/ko-fi_coin.gif" width="60" alt={t("buy_me_a_coffee")} />
					<div>
						<a href={import.meta.env.PUBLIC_DONATION_KOFI_LINK} target="_blank" >
							{t("buy_me_a_coffee")}
						</a>
					</div>
				</Show>
			</div>
			<Show when={showModal()}>
				<dialog class="settings-modal" open>
					<div class="is-flex is-justify-content-end">
						<button
							type="button"
							class="close-button"
							onClick={() => $settingsModalIsShown.set(false)}
						>
							x
						</button>
					</div>

					{/* Language */}
					<div class="field">
						<label class="label">{t("language")}</label>
						<div class="control">
							<select
								class="select"
								onChange={({ target }) => setCurrentLocale(target.value)}
							>
								<For each={availableLocales}>
									{(locale) => (
										<option
											selected={locale === currentLocale()}
											value={locale}
										>
											{localeEmoji(locale)}&nbsp;{locale?.toUpperCase()}
										</option>
									)}
								</For>
							</select>
						</div>
						<p class="help">
							<a
								href="https://localazy.com/p/briskett"
								rel="noopener"
								target="_blank"
							>
								🌎&nbsp;{t("help_translate")}
							</a>
						</p>
					</div>

					{/* TzPro Key */}
					<div class="field">
						<label class="label">{t("tzpro_api_key")}</label>
						<div class="control">
							<input
								class="input"
								type="text"
								placeholder="AB123..."
								value={tempTzProKey()}
								onInput={({ target }) => setTempTzProKey(target.value)}
							/>
						</div>
						<p class="help">
							{t("tzpro_api_key_help")}&nbsp;
							<a
								href="https://github.com/lousando/briskett/wiki/Creating-a-TzKT-API-Key"
								target="_blank"
							>
								https://github.com/lousando/briskett/wiki/Creating-a-TzKT-API-Key
							</a>
						</p>
					</div>

					<div class="field has-text-centered mt-5">
						<div class="control">
							<button class="button is-primary" type="submit">
								{t("save_and_refresh")}
							</button>
							<p class="help">{t("refresh_page_after_changing")}</p>
						</div>
					</div>

					<div>
						<h4 class="is-size-4 has-text-centered">{startCase(t("attributions"))}</h4>
						<div class="has-text-centered">
							<div>
								<a
									href="https://ssameerhrizvi.artstation.com/"
									rel="noopener"
									target="_blank"
								>
									{t("logo_attribution")}
								</a>
							</div>
							<div>
								<a href="https://fontawesome.com/" rel="noopener" target="_blank">
									{t("font_awesome_attribution")}
								</a>
							</div>
						</div>
					</div>
				</dialog>
			</Show>
		</form>
	);
}
