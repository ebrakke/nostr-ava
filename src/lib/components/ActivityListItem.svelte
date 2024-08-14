<script lang="ts">
	import { type Activity } from 'nostr-activities-sdk';
	import UserName from './UserName.svelte';
	import { user } from '$lib';
	import { format } from 'date-fns';

	export let activity: Activity;

	const displayDate = (date: number) => {
		return format(Math.floor(date * 1000), 'yyyy-MM-dd HH:mm:ss');
	};
</script>

<a href="/activities/{activity.id}" class="w-full">
	<div class="card bg-base-200 w-full shadow-xl">
		<div class="card-body">
			<div class="flex justify-between w-full">
				<div>
					<UserName pubkey={activity.author} ndk={user.ndk} />
				</div>
				<div>
					{#if activity.recorded_at}
						<p>{displayDate(activity.recorded_at)}</p>
					{/if}
				</div>
			</div>
			<h2 class="card-title">{activity.title}</h2>
			<p>{activity.description}</p>
		</div>
	</div>
</a>
