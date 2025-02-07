<script lang="ts">
	import { goto } from '$app/navigation';
	import firebaseApp from '$lib/firebase';
	import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

	const auth = getAuth(firebaseApp);
	const provider = new GoogleAuthProvider();

	function initiateSignIn() {
		signInWithPopup(auth, provider)
			.then((result) => {
				const user = result.user;
				console.log(user);
			})
			.catch((error) => {
				console.error(error);
			});
	}
	function backToMain() {
		goto('/');
	}
</script>

<p>Login</p>
<button onclick={initiateSignIn}>Google</button>
<button onclick={backToMain}>Back to main</button>
