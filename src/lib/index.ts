import { user } from "./user";
import { createActivitiesStore } from "./activity";
import { writable, get } from "svelte/store";
import { PUBLIC_BLOSSOM_SERVER, PUBLIC_RELAY } from "$env/static/public";

const activitiesStore = createActivitiesStore(
	[PUBLIC_RELAY],
	user.signer,
	PUBLIC_BLOSSOM_SERVER,
);

export const units = (() => {
	const unitsStore = writable<"metric" | "imperial">("metric", (set) => {
		const preferredUnit = localStorage.getItem("preferredUnit");
		if (preferredUnit) {
			set(preferredUnit as "metric" | "imperial");
		} else {
			localStorage.setItem("na:preferredUnit", "metric");
		}
	});
	return {
		subscribe: unitsStore.subscribe,
		toggle: () => {
			unitsStore.update((u) => (u === "metric" ? "imperial" : "metric"));
			localStorage.setItem("na:preferredUnit", get(unitsStore));
		},
	};
})();

export const shareSettings = writable(
	{
		map: true,
		activityFile: true,
		trimAmount: 200,
	},
	(set) => {
		const settings = localStorage.getItem("na:shareSettings");
		if (settings) {
			set(JSON.parse(settings));
		}
	},
);

shareSettings.subscribe((settings) => {
	localStorage.setItem("na:shareSettings", JSON.stringify(settings));
});

export { user, activitiesStore };
