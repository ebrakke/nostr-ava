<script lang="ts">
	import { units, user } from '$lib';
	import { logout, launch } from 'nostr-login';
	import Auth from './Auth.svelte';

	const handleLogout = async () => {
		await logout();
		window.location.href = '/';
	};
</script>

<div class="navbar bg-base-100 border-b-2 w-full h-[60px] flex justify-between">
	<div class="">
		<a class="btn btn-ghost text-xl" href="/">nostr-ava</a>
	</div>
	<div>
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text pr-2">Metric</span>
				<input
					type="checkbox"
					class="toggle"
					checked={$units === 'imperial'}
					on:change={() => units.toggle()}
				/>
				<span class="label-text pl-2">Imperial</span>
			</label>
		</div>
	</div>
	{#if $user}
		<div class="flex-none">
			<a href="/new" class="btn btn-ghost btn-xs">New Activity</a>
			<button on:click={handleLogout} class="btn btn-ghost btn-xs">Logout</button>
		</div>
	{:else}
		<div class="flex-none">
			<Auth />
		</div>
	{/if}
</div>
