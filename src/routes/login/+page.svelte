<script lang="ts">
	import { goto } from '$app/navigation';
	import firebaseApp from '$lib/firebase';
	import { userState } from '$lib/userState.svelte';
	import {
		createUserWithEmailAndPassword,
		getAuth,
		GoogleAuthProvider,
		signInWithEmailAndPassword,
		signInWithPopup
	} from 'firebase/auth';

	const auth = getAuth(firebaseApp);
	const provider = new GoogleAuthProvider();

	let manualEmail = $state<string>('');
	let manualPassword = $state<string>('');

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

	function initiateSignInWithEmail() {
		signInWithEmailAndPassword(auth, manualEmail, manualPassword)
			.then((result) => {
				const user = result.user;
				console.log(user);
			})
			.catch((error) => {
				console.error(error);
			});
	}

	function createUser() {
		createUserWithEmailAndPassword(auth, manualEmail, manualPassword)
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
<br />
<hr />
<br />
<div class="m-auto flex w-screen flex-row flex-wrap gap-3 p-2 md:size-1/4">
	<input class="basis-full" type="text" placeholder="Email" bind:value={manualEmail} />
	<input class="basis-full" type="password" placeholder="Password" bind:value={manualPassword} />
	<button class="btn flex-1" onclick={createUser}>Register</button>
	<button class="btn flex-1" onclick={initiateSignInWithEmail}>Sign in</button>
</div>
