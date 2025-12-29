import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';

interface SettingsPayload {
    name: string | null;
    tagline: string | null;
    tagline_fr: string | null;
    description: string | null;
    description_fr: string | null;
    terms_url: string | null;
    privacy_url: string | null;
    support_url: string | null;
    logo_url: string | null;
    favicon_url: string | null;
    favicon_svg_url: string | null;
}

interface Props {
    settings: SettingsPayload;
}

export default function AdminBrandingEdit({ settings }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: settings.name ?? '',
        tagline: settings.tagline ?? '',
        tagline_fr: settings.tagline_fr ?? '',
        description: settings.description ?? '',
        description_fr: settings.description_fr ?? '',
        terms_url: settings.terms_url ?? '',
        privacy_url: settings.privacy_url ?? '',
        support_url: settings.support_url ?? '',
        logo: null as File | null,
        favicon: null as File | null,
        favicon_svg: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/branding', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Branding', href: '/admin/branding' }]}>
            <Head title="Branding" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Branding</h1>
                    <p className="text-sm text-muted-foreground">Update the site name, assets and legal/support links.</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>App identity</CardTitle>
                            <CardDescription>Name, logo and favicons.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">App name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Brand logo</Label>
                                    <Input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('logo', e.target.files?.[0] ?? null)}
                                    />
                                    {settings.logo_url ? (
                                        <div className="text-xs text-muted-foreground">Current: <a className="underline" href={settings.logo_url} target="_blank" rel="noreferrer">view</a></div>
                                    ) : null}
                                    {errors.logo ? <p className="text-sm text-destructive">{errors.logo}</p> : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="favicon">Favicon</Label>
                                    <Input
                                        id="favicon"
                                        type="file"
                                        accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg,image/webp"
                                        onChange={(e) => setData('favicon', e.target.files?.[0] ?? null)}
                                    />
                                    {settings.favicon_url ? (
                                        <div className="text-xs text-muted-foreground">Current: <a className="underline" href={settings.favicon_url} target="_blank" rel="noreferrer">view</a></div>
                                    ) : null}
                                    {errors.favicon ? <p className="text-sm text-destructive">{errors.favicon}</p> : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="favicon_svg">Favicon SVG</Label>
                                    <Input
                                        id="favicon_svg"
                                        type="file"
                                        accept="image/svg+xml"
                                        onChange={(e) => setData('favicon_svg', e.target.files?.[0] ?? null)}
                                    />
                                    {settings.favicon_svg_url ? (
                                        <div className="text-xs text-muted-foreground">Current: <a className="underline" href={settings.favicon_svg_url} target="_blank" rel="noreferrer">view</a></div>
                                    ) : null}
                                    {errors.favicon_svg ? <p className="text-sm text-destructive">{errors.favicon_svg}</p> : null}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Copy</CardTitle>
                            <CardDescription>Tagline and description (EN + FR).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="tagline">Tagline</Label>
                                    <Input id="tagline" value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} />
                                    {errors.tagline ? <p className="text-sm text-destructive">{errors.tagline}</p> : null}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tagline_fr">Tagline (FR)</Label>
                                    <Input id="tagline_fr" value={data.tagline_fr} onChange={(e) => setData('tagline_fr', e.target.value)} />
                                    {errors.tagline_fr ? <p className="text-sm text-destructive">{errors.tagline_fr}</p> : null}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="description">Brand description</Label>
                                    <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={5} />
                                    {errors.description ? <p className="text-sm text-destructive">{errors.description}</p> : null}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description_fr">Brand description (FR)</Label>
                                    <Textarea id="description_fr" value={data.description_fr} onChange={(e) => setData('description_fr', e.target.value)} rows={5} />
                                    {errors.description_fr ? <p className="text-sm text-destructive">{errors.description_fr}</p> : null}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Links</CardTitle>
                            <CardDescription>Terms, privacy and support links (internal path or full URL).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="terms_url">Terms URL</Label>
                                    <Input id="terms_url" value={data.terms_url} onChange={(e) => setData('terms_url', e.target.value)} placeholder="/terms or https://..." />
                                    {errors.terms_url ? <p className="text-sm text-destructive">{errors.terms_url}</p> : null}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="privacy_url">Privacy URL</Label>
                                    <Input id="privacy_url" value={data.privacy_url} onChange={(e) => setData('privacy_url', e.target.value)} placeholder="/privacy or https://..." />
                                    {errors.privacy_url ? <p className="text-sm text-destructive">{errors.privacy_url}</p> : null}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="support_url">Support URL</Label>
                                    <Input id="support_url" value={data.support_url} onChange={(e) => setData('support_url', e.target.value)} placeholder="/support or https://..." />
                                    {errors.support_url ? <p className="text-sm text-destructive">{errors.support_url}</p> : null}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
