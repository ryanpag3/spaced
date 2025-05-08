export default class StringUtils {
    static hasText(value?: string | null): boolean {
        return typeof value === 'string' && value.trim().length > 0;
    }
}