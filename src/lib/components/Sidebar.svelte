<script lang="ts">
	import { user, activitiesStore } from '$lib';
	let activities = activitiesStore.userActivities;
</script>

<div>
	{#if $user}
		<span>{$user.profile?.name}'s activities</span>
	{/if}
	<hr />
	<div class="mt-4 flex flex-col gap-x-2">
		{#if $activities}
			{#each $activities as activity}
				<div class="truncate">
					<a href="/activities/{activity.id}">{activity.title}</a>
				</div>
			{/each}
		{/if}
	</div>
</div>
