<script lang="ts">
	import { user } from '$lib';
	import { NDKNip07Signer } from '@nostr-dev-kit/ndk';
	import { init, launch } from 'nostr-login';

	const handleLogin = () => {
		init({
			perms:
				'sign_event:30100,sign_event:30101,sign_event:30102,sign_event:24242,nip44_encrypt,nip44_decrypt',
			noBanner: true,
			onAuth: (npub, o) => {
				if (o.type === 'login') {
					const signer = new NDKNip07Signer();
					user.setUserFromExtension(signer);
				}
			},
			methods: ['connect']
		});
		launch();
	};
</script>

<div class="flex flex-col justify-center w-full">
	<button class="btn btn-info" on:click={handleLogin}>Login With Bunker</button>
</div>
