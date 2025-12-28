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
import { BookOpen, LayoutGrid, Users, GraduationCap, BarChart, Award, Library, ShieldQuestion, Shield } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Catalog',
            href: studentCoursesRoutes.index(),
            icon: BookOpen,
        },
        {
            title: 'Certificates',
            href: certificatesRoutes.index(),
            icon: Award,
        },
    ];

    if (auth.user?.role === 'admin') {
        mainNavItems.push({
            title: 'Admin Overview',
            href: adminDashboardRoute(),
            icon: BarChart,
        });
        mainNavItems.push({
            title: 'Courses',
            href: adminCoursesRoutes.index(),
            icon: GraduationCap,
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
                            <Link href={dashboard()} prefetch>
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
