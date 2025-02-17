function createKeyState() {
    let derivedKey = $state();
    function deriveKey(password: string) {
        console.log("Key is derived")
        derivedKey = password
    }
    return {
        get derivedKey() {
            return derivedKey;
        },
        deriveKey
    }
}

export const keyState = createKeyState();