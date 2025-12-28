import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { type PropsWithChildren } from 'react';

function FlashMessages() {
    const page = usePage<SharedData & { flash?: { success?: string | null; error?: string | null } }>();
    const success = page.props.flash?.success;
    const error = page.props.flash?.error;

    if (!success && !error) {
        return null;
    }

    if (error) {
        return (
            <div className="px-6 pt-4 md:px-4">
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="px-6 pt-4 md:px-4">
            <Alert>
                <CheckCircle2 />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
            </Alert>
        </div>
    );
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <FlashMessages />
                {children}
            </AppContent>
        </AppShell>
    );
}
