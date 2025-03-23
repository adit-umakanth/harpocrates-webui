<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import firebaseApp from '$lib/firebase';
	import { keyState } from '$lib/keyState.svelte';
	import { userState } from '$lib/userState.svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faEdit, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
	import {
		addDoc,
		collection,
		CollectionReference,
		deleteDoc,
		doc,
		getFirestore,
		orderBy,
		query,
		where,
		type DocumentData
	} from 'firebase/firestore';
	import { dbState } from '$lib/dbState.svelte';

	const db = getFirestore(firebaseApp);

	const emptyEntryState = {
		date: '',
		entry: ''
	};
	let newEntryState = $state(emptyEntryState);
	let entriesCollection: CollectionReference<DocumentData, DocumentData> | null = null;

	$effect(() => {
		console.log(userState.user);
		if (userState.user === undefined) {
			return;
		}
		entriesCollection = collection(db, `users/${userState.user!.uid}/entries`);
		const journalQuery = query(
			entriesCollection,
			where('journal', '==', page.params.journal),
			orderBy('date', 'desc')
		);
		dbState.loadJournalEntries(userState.user!.uid, journalQuery);
	});

	async function addJournalEntry() {
		let ivBuffer = window.crypto.getRandomValues(new Uint8Array(12));
		let cipherArray = await window.crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: ivBuffer },
			keyState.derivedKey!,
			new TextEncoder().encode(newEntryState.entry)
		);
		addDoc(entriesCollection!, {
			date: newEntryState.date,
			journal: page.params.journal,
			iv: btoa(String.fromCharCode(...ivBuffer)),
			entry: btoa(String.fromCharCode(...new Uint8Array(cipherArray)))
		});
		newEntryState = emptyEntryState;
	}

	async function decryptEntry(ciphertext: string, iv: string | null | undefined) {
		if (!keyState.derivedKey) {
			return ciphertext;
		}
		let cipherArray = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
		let ivBuffer = Uint8Array.from(atob(iv!), (c) => c.charCodeAt(0));
		try {
			let decryptedArray = await window.crypto.subtle.decrypt(
				{ name: 'AES-GCM', iv: ivBuffer },
				keyState.derivedKey!,
				cipherArray
			);
			return new TextDecoder().decode(decryptedArray);
		} catch (err) {
			console.error(err);
		}
	}

	async function deleteEntry(documentId: string) {
		console.log('Deleting');
		deleteDoc(doc(db, `users/${userState.user!.uid}/entries`, documentId));
		goto(`/journal/${page.params.journal}`);
	}
</script>

<p class="capitalize">{page.params.journal}</p>
<br />
<div class="flex flex-row p-2">
	<input class="basis-1/3" type="date" bind:value={newEntryState.date} />
	<textarea bind:value={newEntryState.entry}></textarea>
	<button class="btn" onclick={addJournalEntry}><FontAwesomeIcon icon={faPlus} /></button>
</div>
<br />
<br />
<hr />
{#if dbState.journalEntryDocs === null}
	loading...
{:else}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	{#each dbState.journalEntryDocs! as entry}
		<br />
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<p
			onclick={() =>
				goto(
					page.params.date === entry.date
						? `/journal/${page.params.journal}`
						: `/journal/${page.params.journal}/${entry.date}`
				)}
		>
			{entry.date}
			{#if page.params.date === entry.date}<button class="btn"
					><FontAwesomeIcon icon={faEdit} /></button
				><button class="btn" onclick={() => deleteEntry(entry.id)}
					><FontAwesomeIcon icon={faMinus} /></button
				>{/if}
		</p>
		{#if page.params.date === entry.date}
			<p style="white-space: pre-line;">
				{#await decryptEntry(entry.entry, entry.iv) then plaintext}
					{plaintext}
				{/await}
			</p>
		{/if}
		<br />
		<hr />
	{/each}
{/if}
