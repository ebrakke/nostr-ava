<script lang="ts">
	import { user } from '$lib/user';
	import { bytesToHex } from '@noble/hashes/utils';
	import { NDKPrivateKeySigner, NDKNip07Signer } from '@nostr-dev-kit/ndk';
	import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
	import { onMount } from 'svelte';

	let hasExtension = false;
	let dialog: HTMLDialogElement;
	let username: string;
	let sk: string;
	let pk: string;
	let npub: string;
	let nsec: string;

	onMount(async () => {
		if (window.nostr) {
			const signer = new NDKNip07Signer();
			user.setUserFromExtension(signer);
			hasExtension = true;
		}
	});

	$: {
		if (username?.length === 1) {
			const skArr = generateSecretKey();
			sk = bytesToHex(skArr);
			pk = getPublicKey(skArr);
			npub = nip19.npubEncode(pk);
			nsec = nip19.nsecEncode(skArr);
		}
	}
</script>

{#if !hasExtension}
	<!-- Open the modal using ID.showModal() method -->
	<button class="btn btn-ghost btn-sm" on:click={() => dialog?.showModal?.()}>Login</button>
	<dialog id="my_modal_5" class="modal modal-bottom sm:modal-middle" bind:this={dialog}>
		<div class="modal-box">
			<h3 class="text-lg font-bold mb-2">Login</h3>
			<div class="flex flex-col gap-y-4">
				<input type="text" class="input input-bordered w-full" placeholder="nsec..." />
				<button class="btn w-full">Login</button>
			</div>
			<div class="divider">OR</div>
			<button class="btn w-full">Create a user</button>
			<!-- <div class="modal-action"> -->
			<!-- 	<form method="dialog"> -->
			<!-- 		<button class="btn">Close</button> -->
			<!-- 	</form> -->
			<!-- </div> -->
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
{/if}
