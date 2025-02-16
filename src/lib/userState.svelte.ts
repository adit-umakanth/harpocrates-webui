import { getAuth, onAuthStateChanged, type Auth, type User } from "firebase/auth";
import firebaseApp from "./firebase";

async function createUserState(auth: Auth) {
    await auth.authStateReady();
    let user = $state<User | null>(auth.currentUser);
    onAuthStateChanged(auth, (currentUser) => {
        user = currentUser;
    })
    return {
        get user() {
            return user;
        }
    }
}

export const userState = await createUserState(getAuth(firebaseApp))
