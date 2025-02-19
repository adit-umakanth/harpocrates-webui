<script lang="ts">
	import { goto } from '$app/navigation';
	import firebaseApp from '$lib/firebase';
	import { userState } from '$lib/userState.svelte';
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

	$effect(() => {
		if (userState.user !== null && userState.user !== undefined) {
			goto('/journal');
		}
	});
</script>

<p>Login</p>
<button class="btn" onclick={initiateSignIn}>Google</button>
<button class="btn" onclick={backToMain}>Back to main</button>
