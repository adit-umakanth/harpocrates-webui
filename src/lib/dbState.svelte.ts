import { doc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import firebaseApp from './firebase';
import { userState } from './userState.svelte';

type UserInfo = {
	journals?: [string];
	salt?: string;
};

function createDbState() {
	let userInfoDoc = $state<UserInfo | null>(null);
	let journalEntryDocs = $state();
	let db = getFirestore(firebaseApp);
	let userInfoDocReference = doc(db, 'users', userState.user!.uid);

	onSnapshot(userInfoDocReference, async (newDoc) => {
		userInfoDoc = newDoc.data() as UserInfo;
		if (!('salt' in userInfoDoc)) {
			let saltBuffer = window.crypto.getRandomValues(new Uint8Array(32));
			await updateDoc(userInfoDocReference, {
				salt: btoa(String.fromCharCode(...saltBuffer))
			});
		}
	});
	return {
		get userInfoDoc() {
			return userInfoDoc;
		},
		userInfoDocReference
	};
}

export const dbState = createDbState();
