import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        // Extract token if flashed and save to localStorage
        const auth = props.initialPage.props.auth as any;
        if (auth?.token) {
            localStorage.setItem('bearer_token', auth.token);
        }
        if (auth?.clear_token) {
            localStorage.removeItem('bearer_token');
        }

        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

router.on('before', (event) => {
    const savedToken = localStorage.getItem('bearer_token');
    if (savedToken) {
        event.detail.visit.headers['Authorization'] = `Bearer ${savedToken}`;
    }
});
