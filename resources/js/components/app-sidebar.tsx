import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { dashboard as adminDashboardRoute } from '@/routes/admin';
import * as adminCoursesRoutes from '@/routes/admin/courses';
import * as adminCertificatesRoutes from '@/routes/admin/certificates';
import * as questionBankRoutes from '@/routes/admin/question-bank';
import * as usersRoutes from '@/routes/admin/users';
import * as certificatesRoutes from '@/routes/certificates';
import * as studentCoursesRoutes from '@/routes/courses';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, LayoutGrid, Users, GraduationCap, Award, Library, ShieldQuestion, Shield, Palette } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const { isMobile, setOpenMobile } = useSidebar();

    const isAdmin = auth.user?.role === 'admin';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: isAdmin ? adminDashboardRoute() : dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Catalog',
            href: studentCoursesRoutes.index(),
            icon: BookOpen,
        },
    ];

    if (!isAdmin) {
        mainNavItems.push({
            title: 'Certificates',
            href: certificatesRoutes.index(),
            icon: Award,
        });
    }

    if (isAdmin) {
        mainNavItems.push({
            title: 'Courses',
            href: adminCoursesRoutes.index(),
            icon: GraduationCap,
        });
        mainNavItems.push({
            title: 'Branding',
            href: '/admin/branding',
            icon: Palette,
        });
        mainNavItems.push({
            title: 'Certificates',
            href: adminCertificatesRoutes.index(),
            icon: Award,
        });
        mainNavItems.push({
            title: 'Question Bank',
            href: questionBankRoutes.index(),
            icon: Library,
        });
        mainNavItems.push({
            title: 'Users',
            href: usersRoutes.index(),
            icon: Users,
        });
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Support',
            href: '/support',
            icon: ShieldQuestion,
        },
        {
            title: 'Privacy',
            href: '/privacy',
            icon: Shield,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={isAdmin ? adminDashboardRoute() : dashboard()}
                                prefetch
                                onClick={() => {
                                    if (isMobile) {
                                        setOpenMobile(false);
                                    }
                                }}
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
