import { doc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import firebaseApp from './firebase';

type UserInfo = {
	journals?: [string];
	salt?: string;
};

function createDbState() {
	let userInfoDoc = $state.raw<UserInfo | null>(null);
	let journalEntryDocs = $state();
	let userInfoDocReference = $state.raw();

	function loadDbData(uid: string) {
		let db = getFirestore(firebaseApp);
		userInfoDocReference = doc(db, 'users', uid);
		onSnapshot($state.snapshot(userInfoDocReference), async (newDoc) => {
			userInfoDoc = newDoc.data() as UserInfo;
			if (!('salt' in userInfoDoc)) {
				let saltBuffer = window.crypto.getRandomValues(new Uint8Array(32));
				await updateDoc($state.snapshot(userInfoDocReference), {
					salt: btoa(String.fromCharCode(...saltBuffer))
				});
			}
		});
	}

	return {
		get userInfoDoc() {
			return userInfoDoc;
		},
		get userInfoDocReference() {
			return userInfoDocReference;
		},
		loadDbData
	};
}

export const dbState = createDbState();
