export function firstWordUpperCase(text: string) {
    return text.slice(0, 1).toUpperCase() + text.slice(1)
}

export function firstWordLowerCase(text: string) {
    return text.slice(0, 1).toLowerCase() + text.slice(1)
}