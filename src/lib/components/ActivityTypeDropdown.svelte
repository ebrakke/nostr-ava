<script lang="ts">
	import { type ActivityType, activityTypeDisplay } from 'nostr-activities-sdk';

	const pairs = Object.entries(activityTypeDisplay);

	export let value: ActivityType;
</script>

<select bind:value class="select select-bordered">
	{#each pairs as pair}
		<option value={pair[0]}>{pair[1]}</option>
	{/each}
</select>
