import NDK, {
	NDKPrivateKeySigner,
	type NDKSigner,
	type NDKUser,
} from "@nostr-dev-kit/ndk";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { get, writable } from "svelte/store";

const createUserStore = () => {
	const ndk = new NDK({
		explicitRelayUrls: ["wss://nos.lol"],
	});
	const user = writable<NDKUser | undefined>();
	const signer = writable<NDKSigner | undefined>();

	const init = async () => {
		await ndk.connect();
	};

	const setUserFromExtension = async (s: NDKSigner) => {
		ndk.signer = s;
		signer.set(s);
		const u = await ndk.signer.user();
		user.set(u);
	};

	const setUserFromNsec = async (nsec: string) => {
		const pk = nip19.decode(nsec);
		if (pk.type !== "nsec") {
			throw new Error("Invalid NSEC");
		}
		const signer = new NDKPrivateKeySigner(pk.data as unknown as string);
		ndk.signer = signer;
		const u = await signer.user();
		user.set(u);
	};

	const createUser = async ({ username }: string) => {
		const sk = generateSecretKey();
		const nsec = nip19.nsecEncode(sk);
		const pk = getPublicKey(sk);
		const npub = nip19.npubEncode(pk);
	};

	const logout = async () => {
		ndk.signer = undefined;
		user.set(undefined);
	};

	const getProfile = async () => {
		const u = get(user);
		if (u) {
			const profile = await u.fetchProfile();
			user.update((u) => {
				if (!u || !profile) return u;
				u.profile = profile;
				return u;
			});
		}
	};

	return {
		init,
		ndk,
		subscribe: user.subscribe,
		set: user.set,
		getProfile,
		signer,
		logout,
		setUserFromExtension,
		setUserFromNsec,
	};
};

export const user = createUserStore();
