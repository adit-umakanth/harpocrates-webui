import { dbState } from "./dbState.svelte";

function createKeyState() {
    let derivedKey = $state();
    async function deriveKey(password: string) {
        const encodedPassword = new TextEncoder().encode(password)
        const importedKey = await window.crypto.subtle.importKey("raw", encodedPassword, "PBKDF2", false, ['deriveKey'])
        const salt = dbState.userInfoDoc?.salt!;
        const saltBuffer = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
        derivedKey = await window.crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: saltBuffer, iterations: 1000000, hash: "SHA-256" },
            importedKey,
            { name: "AES-GCM", length: 256 },
            false,
            ['encrypt', 'decrypt']
        )
    }
    return {
        get derivedKey() {
            return derivedKey;
        },
        deriveKey
    }
}

export const keyState = createKeyState();