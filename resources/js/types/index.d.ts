import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface BrandConfig {
    name: string;
    tagline: string;
    logo?: string | null;
    links: {
        terms: string;
        privacy: string;
        support: string;
    };
    meta: {
        description: string;
        image: string;
        favicon?: string;
        favicon_svg?: string;
        apple_touch_icon?: string;
    };
    tokens?: {
        radius?: string | null;
    };
    colors: {
        primary: string | null;
        secondary: string | null;
    };
}

export interface SharedData {
    name: string;
    brand?: BrandConfig;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    bio?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
