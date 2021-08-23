export function tzOffset(date: Date) {
    const offset = new Date().getTimezoneOffset() * 60000;
    return new Date(date - offset);
}
