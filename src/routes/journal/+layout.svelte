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

<nav class="border-b-2 border-gray-500 bg-white flex flex-row p-2">
	{#if keyState.derivedKey === null}
		<input type="password" bind:value={password} />
		<button class="btn" onclick={() => {keyState.deriveKey(password); password = ''}}>Unlock</button>
	{:else}
		<button class="btn" onclick={() => keyState.derivedKey = null}>Lock</button>
	{/if}
	<button class="btn" onclick={() => auth.signOut()}>Sign out</button><br /><br />
</nav>
<br />
{@render children()}
