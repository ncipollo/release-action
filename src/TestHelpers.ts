// Utility helper functions for testing

export class TestHelpers {
    /**
     * Formats a timestamp for display
     */
    static formatTimestamp(date: Date): string {
        return date.toISOString();
    }

    /**
     * Validates a tag name format
     */
    static isValidTag(tag: string): boolean {
        return tag.length > 0 && /^[a-zA-Z0-9._-]+$/.test(tag);
    }

    /**
     * Creates a simple greeting message
     */
    static greet(name: string): string {
        return `Hello, ${name}!`;
    }
}
