/** Escapes LIKE/ILIKE metacharacters (\, %, _) so a value matches literally. */
export function escapeLikePattern(value: string) {
    return value.replace(/[\\%_]/g, '\\$&');
}
