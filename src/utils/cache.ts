export class LocalStorageCache {
    /**
     * Get a value from localStorage by key
     * @param key The key to retrieve
     * @returns The parsed value or null if not found
     */
    static get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error getting item from localStorage: ${error}`);
            return null;
        }
    }

    /**
     * Set a value in localStorage by key
     * @param key The key to store the value under
     * @param value The value to store
     */
    static set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting item in localStorage: ${error}`);
        }
    }

    /**
     * Remove a value from localStorage by key
     * @param key The key to remove
     */
    static remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item from localStorage: ${error}`);
        }
    }

    /**
     * Clear all items from localStorage
     */
    static clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error(`Error clearing localStorage: ${error}`);
        }
    }

    /**
     * Check if a key exists in localStorage
     * @param key The key to check
     * @returns True if the key exists, false otherwise
     */
    static has(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }
}