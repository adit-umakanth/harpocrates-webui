import {
	doc,
	DocumentReference,
	enablePersistentCacheIndexAutoCreation,
	getPersistentCacheIndexManager,
	initializeFirestore,
	onSnapshot,
	persistentLocalCache,
	persistentSingleTabManager,
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

export const db = initializeFirestore(firebaseApp, {
	localCache: persistentLocalCache({
		tabManager: persistentSingleTabManager({
			forceOwnership: true
		})
	})
});

const indexManager = getPersistentCacheIndexManager(db);
if (indexManager) {
	enablePersistentCacheIndexAutoCreation(indexManager);
}

function createDbState() {
	let userInfoDoc = $state.raw<UserInfo | null>(null);
	let userInfoDocReference: DocumentReference<DocumentData, DocumentData>;
	let journalEntryDocs = $state.raw<[Entry] | null>(null);

	function loadDbData(uid: string) {
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
		onSnapshot(journalQuery, (querySnapshot) => {
			console.log(querySnapshot);
			console.log(querySnapshot.docChanges());
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
