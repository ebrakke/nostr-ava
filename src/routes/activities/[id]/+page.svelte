<script lang="ts">
	import { activitiesStore, units, user } from '$lib';
	import { page } from '$app/stores';
	import ActivityMap from '$lib/components/ActivityMap.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import UserName from '$lib/components/UserName.svelte';
	import SportsLibSummary from '$lib/components/SportsLibSummary.svelte';

	const activities = activitiesStore.activitiesById;
	const summariesMap = activitiesStore.summariesByActivityId;

	$: id = $page.params.id;
	$: activity = $activities[id];
	$: isOwner = activity?.author === $user?.pubkey;
	$: summaries = $summariesMap[id] || [];

	onMount(async () => {
		if (id && !activity) {
			await activitiesStore.fetchActivityById(id);
		}
	});

	$: geoJSONSummary = summaries.filter((s) => s.type === 'geojson')?.[0];
	let geoJSON: any;
	$: {
		if (!geoJSONSummary) {
			geoJSON = null;
		}
		if (geoJSONSummary) {
			geoJSON = null;
			fetch(geoJSONSummary.content)
				.then((res) => res.json())
				.then((data) => {
					geoJSON = data;
				});
		}
	}

	$: {
		if (activity) {
			activitiesStore.fetchSummariesByActivityId(activity.id);
		}
	}

	const handleDelete = async () => {
		const proceed = confirm('Are you sure you want to delete this activity?');
		if (!proceed) return;
		await activitiesStore.deleteActivity(id);
		goto('/');
	};
</script>

{#if !activity}
	<div>
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else}
	<div class="flex flex-col gap-y-2">
		<div class="flex justify-between">
			<div>
				<h1>{activity?.title}</h1>
				<UserName pubkey={activity.author} ndk={user.ndk} />
			</div>
			{#if isOwner}
				<div>
					<button class="btn btn-info">Edit Activity</button>
					<button class="btn btn-error" on:click={handleDelete}>Delete Activty</button>
				</div>
			{/if}
		</div>
		<p>{activity?.description}</p>
		<section>
			<h2>Summary</h2>
		</section>

		{#each summaries as summary (summary.id)}
			{#if summary.type === 'sports-lib-summary'}
				<div class="p-2">
					<SportsLibSummary {summary} displayUnit={$units} />
				</div>
			{/if}
		{/each}

		{#if geoJSON}
			<section>
				<ActivityMap {geoJSON} />
			</section>
		{/if}
	</div>
{/if}
