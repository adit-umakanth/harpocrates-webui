<script>
	import { goto } from '$app/navigation';
	import firebaseApp from '$lib/firebase';
	import { keyState } from '$lib/keyState.svelte';
	import { userState } from '$lib/userState.svelte';
	import { faLock, faRightFromBracket, faUnlock } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
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

<nav class="bg-surface-a10 flex flex-row p-8">
	{#if keyState.derivedKey === null}
		<input class="input-field" type="password" bind:value={password} />
		<button
			class="btn bg-blue-500"
			onclick={() => {
				keyState.deriveKey(password);
				password = '';
			}}><FontAwesomeIcon icon={faUnlock} /> Unlock</button
		>
	{:else}
		<button class="btn bg-blue-500" onclick={() => (keyState.derivedKey = null)}
			><FontAwesomeIcon icon={faLock} /> Lock</button
		>
	{/if}
	<button class="btn bg-blue-500" onclick={() => auth.signOut()}
		><FontAwesomeIcon icon={faRightFromBracket} /> Sign out</button
	><br /><br />
</nav>
<br />
{@render children()}
