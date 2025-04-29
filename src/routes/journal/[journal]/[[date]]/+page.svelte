<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import firebaseApp from '$lib/firebase';
	import { keyState } from '$lib/keyState.svelte';
	import { userState } from '$lib/userState.svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import {
		faCaretDown,
		faCaretRight,
		faEdit,
		faMinus,
		faPlus
	} from '@fortawesome/free-solid-svg-icons';
	import {
		addDoc,
		collection,
		CollectionReference,
		deleteDoc,
		doc,
		getFirestore,
		orderBy,
		query,
		updateDoc,
		where,
		type DocumentData
	} from 'firebase/firestore';
	import { dbState } from '$lib/dbState.svelte';

	const db = getFirestore(firebaseApp);

	let editMode = $state(false);
	let editText = $state('');

	const emptyEntryState = {
		date: '',
		entry: ''
	};
	let newEntryState = $state(emptyEntryState);
	let entriesCollection: CollectionReference<DocumentData, DocumentData> | null = null;

	$effect(() => {
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

	async function encryptEntry(plaintext: string) {
		let ivBuffer = window.crypto.getRandomValues(new Uint8Array(12));
		let cipherArray = await window.crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: ivBuffer },
			keyState.derivedKey!,
			new TextEncoder().encode(plaintext)
		);
		return {
			iv: btoa(String.fromCharCode(...ivBuffer)),
			entry: btoa(String.fromCharCode(...new Uint8Array(cipherArray)))
		};
	}

	async function addJournalEntry() {
		let encryptedData = await encryptEntry(newEntryState.entry);
		addDoc(entriesCollection!, {
			date: newEntryState.date,
			journal: page.params.journal,
			...encryptedData
		});
		newEntryState = emptyEntryState;
	}

	async function updateJournalEntry(documentId: string) {
		let encryptedData = await encryptEntry(editText);
		await updateDoc(doc(db, `users/${userState.user!.uid}/entries`, documentId), encryptedData);
		editMode = false;
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
			const decryptedText = new TextDecoder().decode(decryptedArray);
			editText = decryptedText;
			return decryptedText;
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
<div class="flex flex-col gap-2 p-4">
	<input type="date" bind:value={newEntryState.date} />
	<div
		class="auto-grow"
		bind:innerText={newEntryState.entry}
		contenteditable="true"
		role="textbox"
		aria-multiline="true"
	></div>
	<button class="btn bg-blue-500" onclick={addJournalEntry} style="width: fit-content;"
		><FontAwesomeIcon icon={faPlus} /></button
	>
</div>
<br />
<hr class="border-blue-300" />
{#if dbState.journalEntryDocs === null}
	loading...
{:else}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	{#each dbState.journalEntryDocs! as entry}
		<br />
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<p>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				class="p-4"
				onclick={() =>
					goto(
						page.params.date === entry.date
							? `/journal/${page.params.journal}`
							: `/journal/${page.params.journal}/${entry.date}`
					)}
				>{#if page.params.date === entry.date}
					<FontAwesomeIcon class="pr-2 text-blue-500" icon={faCaretDown} />
				{:else}
					<FontAwesomeIcon class="pr-2 text-blue-500" icon={faCaretRight} />
				{/if}
				{entry.date}</span
			>
			{#if page.params.date === entry.date}<button
					class="btn bg-blue-500"
					onclick={() => (editMode = true)}><FontAwesomeIcon icon={faEdit} /></button
				><button class="btn bg-red-400" onclick={() => deleteEntry(entry.id)}
					><FontAwesomeIcon icon={faMinus} /></button
				>{/if}
		</p>
		{#if page.params.date === entry.date}
			{#await decryptEntry(entry.entry, entry.iv) then plaintext}
				{#if editMode}
					<div class="p-2">
						<div
							class="auto-grow"
							bind:innerText={editText}
							contenteditable="true"
							role="textbox"
							aria-multiline="true"
						></div>
					</div>
					<button
						class="btn bg-red-300"
						onclick={() => {
							editMode = false;
							editText = plaintext!;
						}}>Cancel</button
					><button class="btn bg-blue-500" onclick={() => updateJournalEntry(entry.id)}>Save</button
					>
				{:else}
					<div class="whitespace-pre-line p-4">{plaintext}</div>
				{/if}
			{/await}
		{/if}
		<br />
		<hr class="border-blue-300" />
	{/each}
{/if}
