<script lang="ts">
	import '../app.css';
	import { user, activitiesStore } from '$lib';
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	onMount(async () => {
		await Promise.all([user.init(), activitiesStore.init()]);
		// init({
		// 	perms:
		// 		'sign_event:30100,sign_event:30101,sign_event:30102,sign_event:24242,nip44_encrypt,nip44_decrypt',
		// 	noBanner: true,
		// 	onAuth: (_, o) => {
		// 		if (o.type === 'login' || o.type === 'signup') {
		// 			const signer = new NDKNip07Signer();
		// 			user.setUserFromExtension(signer);
		// 		}
		// 		if (o.type === 'logout') {
		// 			user.logout();
		// 		}
		// 	},
		// 	otpRequestUrl: 'http://localhost:3000/api/otp/request',
		// 	otpReplyUrl: 'http://localhost:3000/api/otp/reply',
		// 	methods: ['connect']
		// });
	});
</script>

<div class="w-full h-screen flex flex-col">
	<div class="top-0 fixed w-full z-10">
		<Navbar />
	</div>
	<div class="flex h-full mt-[60px]">
		<div class="pl-4 w-full h-full my-4 flex-1">
			<slot />
		</div>
	</div>
</div>
