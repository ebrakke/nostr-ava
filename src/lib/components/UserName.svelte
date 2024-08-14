<script lang="ts" context="module">
	export function prettifyNip05(nip05: string): string {
		if (nip05.startsWith('_@')) {
			return nip05.substring(2);
		} else {
			return nip05;
		}
	}
	export function truncatedBech32(bech32: string, length?: number): string {
		return `${bech32.substring(0, length || 9)}...`;
	}
</script>

<script lang="ts">
	import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
	import type NDK from '@nostr-dev-kit/ndk';

	/**
	 * The NDK instance you want to use
	 */
	export let ndk: NDK;

	/**
	 * The npub of the user you want to display a name for
	 */
	export let npub: string | undefined = undefined;

	/**
	 * The hexpubkey of the user you want to display a name for
	 */
	export let pubkey: string | undefined = undefined;

	/**
	 * The user object of the user you want to display a name for
	 */
	export let user: NDKUser | undefined = undefined;

	/**
	 * An NDKUserProfile object for the user you want to display a name for
	 */
	export let userProfile: NDKUserProfile | undefined = undefined;

	/**
	 * Optionally specify the maximum length of the npub to display if a name is not available
	 */
	export let npubMaxLength: number | undefined = undefined;

	if (!user) {
		let opts = npub ? { npub } : { hexpubkey: pubkey };
		try {
			user = ndk.getUser(opts);
			npub = user.npub;
		} catch (e) {
			console.error(`error trying to get user`, { opts }, e);
		}
	}

	const _npub = npub || user?.npub;
	const truncatedNpub = npubMaxLength ? truncatedBech32(_npub!, npubMaxLength) : _npub;

	function chooseNameFromDisplay(profile?: NDKUserProfile) {
		return (
			profile?.displayName ||
			profile?.name ||
			(profile?.nip05 && prettifyNip05(profile.nip05)) ||
			truncatedNpub
		);
	}
</script>

<span class="name {$$props.class}" style={$$props.style}>
	{#if userProfile}
		{chooseNameFromDisplay(userProfile)}
	{:else if user}
		{#await user.fetchProfile()}
			{chooseNameFromDisplay()}
		{:then value}
			{chooseNameFromDisplay(user.profile)}
		{:catch error}
			<span class="name--error {$$props.class}" data-error={error}>
				{truncatedNpub}
			</span>
		{/await}
	{/if}
</span>
