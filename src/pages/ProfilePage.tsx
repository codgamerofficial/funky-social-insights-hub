import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, User as UserIcon, Mail, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    bio: string | null;
    created_at: string;
}

const ProfilePage = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error) throw error;

            setProfile(data);
            setFullName(data.full_name || '');
            setBio(data.bio || '');
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast({
                title: 'Error',
                description: 'Failed to load profile',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    bio: bio,
                })
                .eq('id', user?.id);

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Profile updated successfully',
            });

            setEditing(false);
            fetchProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: 'Error',
                description: 'Failed to update profile',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-6 py-8 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    const getInitials = (name: string | null) => {
        if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-6 py-8 space-y-8 max-w-4xl">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gradient-funky">Profile</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences</p>
                </div>

                <div className="grid gap-6">
                    {/* Profile Card */}
                    <Card className="glass-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="w-20 h-20 gradient-instagram">
                                        <AvatarFallback className="text-white text-2xl font-bold">
                                            {getInitials(profile?.full_name || null)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-2xl">
                                            {profile?.full_name || 'User'}
                                        </CardTitle>
                                        <CardDescription>{profile?.email}</CardDescription>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditing(!editing)}
                                    disabled={saving}
                                >
                                    {editing ? 'Cancel' : 'Edit Profile'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {editing ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Input
                                            id="bio"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Tell us about yourself"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="gradient-funky text-white hover:opacity-90"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-muted-foreground">
                                        <UserIcon className="w-5 h-5" />
                                        <span>{profile?.full_name || 'No name set'}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-muted-foreground">
                                        <Mail className="w-5 h-5" />
                                        <span>{profile?.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-muted-foreground">
                                        <Calendar className="w-5 h-5" />
                                        <span>
                                            Member since {new Date(profile?.created_at || '').toLocaleDateString()}
                                        </span>
                                    </div>
                                    {profile?.bio && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">{profile.bio}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Actions */}
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Account Actions</CardTitle>
                            <CardDescription>Manage your account settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="destructive"
                                onClick={handleSignOut}
                                className="w-full sm:w-auto"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
