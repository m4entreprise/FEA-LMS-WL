import AppLogoIcon from '@/components/app-logo-icon';
import { AppFooter } from '@/components/app-footer';
import { InertiaToastListener } from '@/components/inertia-toast-listener';
import { Toaster } from '@/components/toaster';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';

interface PublicLayoutProps {
    title: string;
    headerRight?: ReactNode;
}

export default function PublicLayout({ title, headerRight, children }: PropsWithChildren<PublicLayoutProps>) {
    const page = usePage<SharedData>();

    return (
        <>
            <Head title={title} />
            <InertiaToastListener />
            <Toaster />
            <div className="min-h-screen bg-background">
                <header className="border-b border-sidebar-border/70">
                    <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
                        <Link href={home()} className="flex items-center gap-2">
                            <AppLogoIcon className="h-7 w-7 fill-current text-black dark:text-white" />
                            <div className="text-sm font-semibold text-foreground">{page.props.name}</div>
                        </Link>
                        {headerRight ?? (
                            <Link href={home()} className="text-sm text-muted-foreground hover:underline">
                                Home
                            </Link>
                        )}
                    </div>
                </header>

                <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>

                <AppFooter />
            </div>
        </>
    );
}
