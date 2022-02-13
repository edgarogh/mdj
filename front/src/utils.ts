import React, {useState} from "react";

// TODO find an alternative that doesn't make React angry at me
export const VOID_URL = "javascript:void 0";

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

const MARKING_DECORATION_STYLE_DONE = { textDecoration: 'line-through' };
const MARKING_DECORATION_STYLE_NONE = { };
const MARKING_DECORATION_SUFFIX_STARTED = '*';
const MARKING_DECORATION_SUFFIX_FLR = '?';
const MARKING_DECORATION_SUFFIX_NONE = '';

export function markingDecoration(marking: string | undefined | null): readonly [React.CSSProperties, string] {
    switch (marking) {
        default:
            console.warn("Unknown marking " + marking);
            // deliberate fallthrough
        case null:
        case undefined:
        case '': return [MARKING_DECORATION_STYLE_NONE, MARKING_DECORATION_SUFFIX_NONE];
        case 'started': return [MARKING_DECORATION_STYLE_NONE, MARKING_DECORATION_SUFFIX_STARTED];
        case 'further_learning_required': return [MARKING_DECORATION_STYLE_NONE, MARKING_DECORATION_SUFFIX_FLR];
        case 'done': return [MARKING_DECORATION_STYLE_DONE, MARKING_DECORATION_SUFFIX_NONE];
    }
}

export function decodeMarkingColor(marking: string | undefined | null): 'green' | 'yellow' | 'orange' | 'red' | null {
    switch (marking) {
        default:
            console.warn("Unknown marking " + marking);
        // deliberate fallthrough
        case null:
        case undefined:
        case '': return null;

        case 'yellow':
        case 'started': return 'yellow';

        case 'orange':
        case 'further_learning_required': return 'orange';

        case 'red': return 'red';

        case 'green':
        case 'done': return 'green';
    }
}
