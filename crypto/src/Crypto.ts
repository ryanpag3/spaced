export interface Crypto {
    /**
     * Generate a key encryption key from a password.
     */
    getKEK: (password: string) => Promise<Buffer>;
}