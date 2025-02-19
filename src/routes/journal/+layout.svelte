<script>
	import { goto } from '$app/navigation';
	import firebaseApp from '$lib/firebase';
	import { keyState } from '$lib/keyState.svelte';
	import { userState } from '$lib/userState.svelte';
	import { getAuth } from 'firebase/auth';

	let { children } = $props();
	const auth = getAuth(firebaseApp);

	let password = $state('');

	$effect(() => {
		if (userState.user === null) {
			goto('/login');
		}
	});
</script>

<nav class="border-b-2 border-gray-500 bg-white">
	<button class="btn" onclick={() => auth.signOut()}>Sign out</button><br /><br />
	<input type="password" bind:value={password} />
	<button class="btn" onclick={() => keyState.deriveKey(password)}>Unlock</button>
</nav>
<br />
{@render children()}
