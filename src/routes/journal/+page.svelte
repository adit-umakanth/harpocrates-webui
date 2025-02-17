<script lang="ts">
	import { goto } from '$app/navigation';
	import { dbState } from '$lib/dbState.svelte';
	import { arrayUnion, doc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
	import { onDestroy } from 'svelte';

	let journalToAdd = $state('');
	function addJournal() {
		updateDoc(dbState.userInfoDocReference, {
			journals: arrayUnion(journalToAdd)
		}).then((e) => (journalToAdd = ''));
	}
</script>

<input bind:value={journalToAdd} /><button class="btn" onclick={addJournal}>+</button>
<br />
{#if dbState.userInfoDoc === null}
	loading...
{:else}
	<ul>
		{#each dbState.userInfoDoc.journals! as journal}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<li class="capitalize" onclick={() => goto(`/journal/${journal}`)}>
				{journal}
			</li>
		{/each}
	</ul>
{/if}
