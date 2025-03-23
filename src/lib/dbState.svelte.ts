import {
	doc,
	DocumentReference,
	getFirestore,
	onSnapshot,
	Query,
	updateDoc,
	type DocumentData
} from 'firebase/firestore';
import firebaseApp from './firebase';

type UserInfo = {
	journals?: [string];
	salt?: string;
};

type Entry = {
	id: string;
	date: string;
	entry: string;
	journal: string;
	iv?: string;
};

function createDbState() {
	let userInfoDoc = $state.raw<UserInfo | null>(null);
	let userInfoDocReference: DocumentReference<DocumentData, DocumentData>;
	let journalEntryDocs = $state.raw<[Entry] | null>(null);

	function loadDbData(uid: string) {
		let db = getFirestore(firebaseApp);
		userInfoDocReference = doc(db, 'users', uid);
		onSnapshot(userInfoDocReference, async (newDoc) => {
			userInfoDoc = newDoc.data() as UserInfo;
			if (!('salt' in userInfoDoc)) {
				let saltBuffer = window.crypto.getRandomValues(new Uint8Array(32));
				await updateDoc(userInfoDocReference, {
					salt: btoa(String.fromCharCode(...saltBuffer))
				});
			}
		});
	}

	function loadJournalEntries(uid: string, journalQuery: Query<DocumentData, DocumentData>) {
		let db = getFirestore(firebaseApp);
		onSnapshot(journalQuery, (querySnapshot) => {
			const tempEntries: any = [];
			querySnapshot.forEach((doc) => {
				tempEntries.push({ ...doc.data(), id: doc.id });
			});
			journalEntryDocs = tempEntries;
		});
	}

	return {
		get userInfoDoc() {
			return userInfoDoc;
		},
		get userInfoDocReference() {
			return userInfoDocReference;
		},
		get journalEntryDocs() {
			return journalEntryDocs;
		},
		loadDbData,
		loadJournalEntries
	};
}

export const dbState = createDbState();
