import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface AppFooterProps {
    className?: string;
}

export function AppFooter({ className }: AppFooterProps) {
    const page = usePage<SharedData>();
    const appName = page.props.brand?.name ?? page.props.name ?? 'M4 LMS';
    const version = import.meta.env.VITE_APP_VERSION ?? 'dev';

    const termsUrl = page.props.brand?.links?.terms ?? '/terms';
    const supportUrl = page.props.brand?.links?.support ?? '/support';
    const privacyUrl = page.props.brand?.links?.privacy ?? '/privacy';

    const isExternal = (href: string) => href.startsWith('http://') || href.startsWith('https://');

    return (
        <footer className={className ?? ''}>
            <div className="border-t border-sidebar-border/70">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-4">
                    <div>
                        <span className="font-medium text-foreground">{appName}</span>
                        <span className="ml-2">v{version}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {isExternal(termsUrl) ? (
                            <a className="hover:underline" href={termsUrl} target="_blank" rel="noreferrer">
                                Terms
                            </a>
                        ) : (
                            <Link className="hover:underline" href={termsUrl}>
                                Terms
                            </Link>
                        )}
                        {isExternal(supportUrl) ? (
                            <a className="hover:underline" href={supportUrl} target="_blank" rel="noreferrer">
                                Support
                            </a>
                        ) : (
                            <Link className="hover:underline" href={supportUrl}>
                                Support
                            </Link>
                        )}
                        {isExternal(privacyUrl) ? (
                            <a className="hover:underline" href={privacyUrl} target="_blank" rel="noreferrer">
                                Privacy
                            </a>
                        ) : (
                            <Link className="hover:underline" href={privacyUrl}>
                                Privacy
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
