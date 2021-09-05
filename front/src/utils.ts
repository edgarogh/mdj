import {useState} from "react";

export function tzOffset(date: Date | number) {
    const offset = new Date().getTimezoneOffset() * 60000;
    return new Date(date - offset);
}

export function roundDate(date: Date = new Date(Date.now())): Date {
    return new Date(Date.parse(date.toISOString().substr(0, 10)));
}

/**
 * Memoises a value retaining only non-undefined ones. In other words, it keeps an internal state that is only updated
 * to the value of `value` when `value` is not null. This state is returned, and may be undefined if it is never
 * initialized.
 */
export function useNonNullMemo<T>(value: T | undefined): T | undefined {
    const [memo, setMemo] = useState<T | undefined>(undefined);

    if (value !== undefined && value !== memo) {
        setMemo(value);
        return value;
    } else {
        return memo;
    }
}
