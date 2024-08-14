<script lang="ts">
	import { activitiesStore } from '$lib';
	import ActivityListItem from '$lib/components/ActivityListItem.svelte';
	import { onMount } from 'svelte';

	const activities = activitiesStore.activities;

	onMount(async () => {
		await activitiesStore.fetchActivities();
	});
</script>

<div class="flex flex-col w-full justify-center items-center">
	<div class="prose">
		Welcome to Nostrava! This client allows users to upload gpx files as NOSTR notes and analyze the
		GPX files.
		<p>For more information about the project, please view the <a href="/">NIP</a>.</p>
		<p>
			To get started, upload a GPX file by clicking the "New Activity" button in the top right
			corner.
		</p>
		<p>As you upload activities, they will appear on the sidebar</p>
	</div>

	{#if $activities.length}
		<div class="flex flex-col gap-y-2 w-full">
			{#each $activities as activity (activity.id)}
				<ActivityListItem {activity} />
			{/each}
		</div>
	{/if}
</div>
