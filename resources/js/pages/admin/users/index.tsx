import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import * as usersRoutes from '@/routes/admin/users';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: usersRoutes.index().url,
    },
];

interface Props {
    users: User[];
}

export default function UserIndex({ users }: Props) {
    const { delete: destroy, processing } = useForm();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Users</h1>
                        <p className="text-sm text-muted-foreground">Manage your application users and their roles.</p>
                    </div>
                    <Button asChild>
                        <Link href={usersRoutes.create().url}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add User
                        </Link>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="min-w-[640px] w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">Email</th>
                                <th className="px-6 py-3 font-medium">Role</th>
                                <th className="px-6 py-3 font-medium text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">{user.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link 
                                                href={usersRoutes.show(user.id).url}
                                            >
                                                View
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link 
                                                href={usersRoutes.edit(user.id).url}
                                            >
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            aria-label="Delete user"
                                            title="Delete user"
                                            onClick={() => {
                                                setUserIdToDelete(user.id);
                                                setConfirmOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <ConfirmDialog
                    open={confirmOpen}
                    onOpenChange={(open) => {
                        setConfirmOpen(open);
                        if (!open) {
                            setUserIdToDelete(null);
                        }
                    }}
                    title="Delete user"
                    description="This action cannot be undone."
                    confirmText="Delete"
                    confirmVariant="destructive"
                    confirmDisabled={processing}
                    onConfirm={() => {
                        if (userIdToDelete === null) return;
                        destroy(usersRoutes.destroy(userIdToDelete).url, { preserveScroll: true });
                    }}
                />
            </div>
        </AppLayout>
    );
}
