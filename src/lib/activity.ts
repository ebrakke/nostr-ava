import NDK, { NDKEvent, type NDKSigner } from "@nostr-dev-kit/ndk";
import { BlossomClient } from "blossom-client-sdk";
import { groupBy, keyBy, uniqBy } from "lodash";
import {
	ActivityClient,
	activityFromEvent,
	summaryFromEvent,
	type CreateActivityParams,
	type CreateSummaryParams,
} from "nostr-activities-sdk";
import { getEventHash, type UnsignedEvent } from "nostr-tools";
import { derived, writable, type Writable } from "svelte/store";

export const createActivitiesStore = (
	activityRelays: string[],
	signer: Writable<NDKSigner | undefined>,
	blossomServerEndpoint: string,
) => {
	const ndk = new NDK({ explicitRelayUrls: activityRelays });
	signer.subscribe((s) => {
		if (s) {
			ndk.signer = s;
		}
	});

	const blossomClient = new BlossomClient(
		blossomServerEndpoint,
		async (draft) => {
			// add the pubkey to the draft event
			const event: UnsignedEvent = {
				...draft,
				pubkey: ndk.activeUser!.pubkey!,
			};
			// get the signature
			const sig = await ndk.signer!.sign(event);

			// return the event + id + sig
			return { ...event, sig, id: getEventHash(event) };
		},
	);

	const activityClient = new ActivityClient(ndk, blossomClient);
	const activityEvents = writable<NDKEvent[]>([]);
	const activityEventsById = derived(activityEvents, ($activities) =>
		keyBy($activities, (e) => e.replaceableDTag()),
	);
	const summaryEvents = writable<NDKEvent[]>([]);
	const summaryEventsById = derived(summaryEvents, ($summaries) =>
		keyBy($summaries, (e) => e.replaceableDTag()),
	);

	const activities = derived(activityEvents, ($activities) =>
		$activities.map(activityFromEvent),
	);
	const activitiesById = derived(activities, ($activities) =>
		keyBy($activities, "id"),
	);
	const summaries = derived(summaryEvents, ($summaries) =>
		$summaries.map(summaryFromEvent),
	);
	const summariesById = derived(summaries, ($summaries) =>
		keyBy($summaries, "id"),
	);
	const summariesByActivityId = derived([summaries], ([$summaries]) =>
		groupBy($summaries, (s) => s.reference_ids[0]),
	);

	const init = async () => {
		await ndk.connect();
	};

	const createActivity = async (activity: CreateActivityParams) => {
		const event = await activityClient.createActivityEvent(activity);
		activityEvents.update((a) => [...a, event]);
		return activityFromEvent(event);
	};

	const fetchActivityById = async (activityId: string) => {
		const event = await activityClient.getActivity(activityId);
		if (event) {
			activityEvents.update((a) => uniqBy([...a, event], "id"));
		}
	};

	const fetchActivities = async () => {
		const events = await activityClient.getActivities();
		activityEvents.update((a) => uniqBy([...a, ...events], "id"));
	};

	const fetchSummariesByActivityId = async (activityId: string) => {
		const events = await activityClient.getSummariesByActivityId(activityId);
		summaryEvents.update((a) => uniqBy([...a, ...events], "id"));
	};

	const deleteActivity = async (activityId: string) => {
		await activityClient.deleteActivity(activityId);
		activityEvents.update((a) =>
			a.filter((e) => e.replaceableDTag() !== activityId),
		);
	};

	const uploadFile = async (file: File) => {
		return activityClient.uploadActivityFile(file);
	};

	const createSummary = async (summary: CreateSummaryParams) => {
		const event = await activityClient.createSummaryEvent(summary);
		summaryEvents.update((a) => [...a, event]);
		return summaryFromEvent(event);
	};

	return {
		init,
		activities,
		activitiesById,
		activityEvents,
		activityEventsById,
		summaries,
		summariesById,
		summariesByActivityId,
		summaryEvents,
		summaryEventsById,
		fetchActivities,
		fetchActivityById,
		fetchSummariesByActivityId,
		createActivity,
		deleteActivity,
		uploadFile,
		createSummary,
	};
};
