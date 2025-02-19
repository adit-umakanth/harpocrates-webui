import { getAuth, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import firebaseApp from './firebase';
import { dbState } from './dbState.svelte';

function createUserState(auth: Auth) {
	let user = $state.raw<User | null | undefined>(undefined);
	onAuthStateChanged(auth, (currentUser) => {
		user = currentUser;
		if (currentUser !== null) {
			dbState.loadDbData(currentUser.uid);
		}
	});
	return {
		get user() {
			return user;
		}
	};
}

export const userState = createUserState(getAuth(firebaseApp));
