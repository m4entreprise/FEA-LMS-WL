import AppLogoIcon from './app-logo-icon';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export default function AppLogo() {
    const page = usePage<SharedData>();
    const appName = page.props.brand?.name ?? page.props.name ?? 'M4 LMS';
    const logoUrl = page.props.brand?.logo ?? null;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {logoUrl ? (
                    <img src={logoUrl} alt={appName} className="size-5" />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-sidebar-primary-foreground" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {appName}
                </span>
            </div>
        </>
    );
}
