<script lang="ts">
	import { goto } from '$app/navigation';
	import firebaseApp from '$lib/firebase';
	import { userState } from '$lib/userState.svelte';
	import { arrayUnion, doc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
	import { onDestroy } from 'svelte';

	type UserData = {
		journals: [string];
	};

	const db = getFirestore(firebaseApp);
	const userDocument = doc(db, 'users', userState.user!.uid);
	let userData = $state<UserData>();
	const unsub = onSnapshot(userDocument, (doc) => {
		console.log(`Document snapshot`);
		console.log(doc);
		userData = doc.data() as UserData;
	});

	let journalToAdd = $state('');
	function addJournal() {
		updateDoc(userDocument, {
			journals: arrayUnion(journalToAdd)
		}).then((e) => (journalToAdd = ''));
	}

	onDestroy(() => {
		unsub();
	});
</script>

<input bind:value={journalToAdd} /><button class="btn" onclick={addJournal}>+</button>
<br />
{#if userData === undefined}
	loading...
{:else}
	<ul>
		{#each userData!.journals as journal}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<li class="capitalize" onclick={() => goto(`/journal/${journal}`)}>
				{journal}
			</li>
		{/each}
	</ul>
{/if}
