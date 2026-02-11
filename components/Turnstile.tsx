import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Cloudflare Turnstile Component
 * 
 * Provides bot protection for forms. Can be either:
 * - visible: Shows a "Verify you are human" checkbox
 * - invisible: Runs in background, no user interaction needed
 * - managed: Cloudflare decides based on risk level
 * 
 * @see https://developers.cloudflare.com/turnstile/
 */

interface TurnstileProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: (error: string) => void;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact' | 'invisible';
    className?: string;
}

// Extend window to include turnstile
declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
            getResponse: (widgetId: string) => string | undefined;
        };
        onTurnstileLoad?: () => void;
    }
}

interface TurnstileRenderOptions {
    sitekey: string;
    callback: (token: string) => void;
    'expired-callback'?: () => void;
    'error-callback'?: (error: string) => void;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact' | 'invisible';
}

// Track if script is loading/loaded
let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadTurnstileScript(): Promise<void> {
    return new Promise((resolve) => {
        if (scriptLoaded) {
            resolve();
            return;
        }

        loadCallbacks.push(resolve);

        if (scriptLoading) {
            return;
        }

        scriptLoading = true;

        // Set up callback for when script loads
        window.onTurnstileLoad = () => {
            scriptLoaded = true;
            scriptLoading = false;
            loadCallbacks.forEach(cb => cb());
            loadCallbacks.length = 0;
        };

        // Create and append script
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    });
}

export const Turnstile: React.FC<TurnstileProps> = ({
    siteKey,
    onVerify,
    onExpire,
    onError,
    theme = 'auto',
    size = 'normal',
    className = '',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const renderWidget = useCallback(() => {
        // Skip if no siteKey
        if (!siteKey || !containerRef.current || !window.turnstile) return;

        // Clean up existing widget
        if (widgetIdRef.current) {
            try {
                window.turnstile.remove(widgetIdRef.current);
            } catch (e) {
                // Widget might already be removed
            }
        }

        // Render new widget
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            'expired-callback': onExpire,
            'error-callback': onError,
            theme: theme as 'light' | 'dark' | 'auto',
            size: size as 'normal' | 'compact' | 'invisible',
        });
    }, [siteKey, onVerify, onExpire, onError, theme, size]);

    useEffect(() => {
        // Skip if no siteKey provided
        if (!siteKey) return;

        loadTurnstileScript().then(renderWidget);

        return () => {
            // Cleanup on unmount
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch (e) {
                    // Widget might already be removed
                }
            }
        };
    }, [renderWidget, siteKey]);

    // Don't render container if no siteKey
    if (!siteKey) return null;

    return <div ref={containerRef} className={className} />;
};

/**
 * Hook for invisible Turnstile
 * Use this when you want Turnstile to run without showing any UI
 * Returns null token and isLoading false if siteKey is not provided
 */
export function useTurnstile(siteKey: string): {
    token: string | null;
    isLoading: boolean;
    reset: () => void;
} {
    const [token, setToken] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(!!siteKey); // Only loading if siteKey exists
    const widgetIdRef = useRef<string | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Skip if no siteKey provided
        if (!siteKey) {
            setIsLoading(false);
            return;
        }

        // Create hidden container
        const container = document.createElement('div');
        container.style.display = 'none';
        document.body.appendChild(container);
        containerRef.current = container;

        loadTurnstileScript().then(() => {
            if (!window.turnstile || !containerRef.current) return;

            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: (t) => {
                    setToken(t);
                    setIsLoading(false);
                },
                'expired-callback': () => {
                    setToken(null);
                },
                size: 'invisible',
            });
        });

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch (e) {
                    // Ignore
                }
            }
            if (containerRef.current) {
                containerRef.current.remove();
            }
        };
    }, [siteKey]);

    const reset = useCallback(() => {
        if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
            setToken(null);
            setIsLoading(true);
        }
    }, []);

    return { token, isLoading, reset };
}

export default Turnstile;
