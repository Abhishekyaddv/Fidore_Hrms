import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            'bg-color': ['bg-sidebar'],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return customTwMerge(clsx(inputs));
}
