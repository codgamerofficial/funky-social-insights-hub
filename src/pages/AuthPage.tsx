import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Instagram, Facebook, Sparkles, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const signInSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

const AuthPage = () => {
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const signInForm = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const signUpForm = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const handleSignIn = async (data: SignInFormData) => {
        setIsLoading(true);
        const { error } = await signIn(data.email, data.password);
        setIsLoading(false);

        if (!error) {
            navigate('/dashboard');
        }
    };

    const handleSignUp = async (data: SignUpFormData) => {
        setIsLoading(true);
        const { error } = await signUp(data.email, data.password, data.fullName);
        setIsLoading(false);

        if (!error) {
            // User will need to verify email, so stay on auth page
            signUpForm.reset();
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                {/* Logo Section */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 gradient-instagram rounded-2xl flex items-center justify-center mx-auto animate-pulse-glow">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gradient-instagram">
                        IG&FB Analyzer
                    </h1>
                    <p className="text-muted-foreground">
                        Social Media Analytics & Insights
                    </p>
                </div>

                {/* Auth Forms */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Welcome</CardTitle>
                        <CardDescription className="text-center">
                            Sign in to your account or create a new one
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="signin" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="signin">Sign In</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            {/* Sign In Form */}
                            <TabsContent value="signin">
                                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signin-email">Email</Label>
                                        <Input
                                            id="signin-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            {...signInForm.register('email')}
                                            disabled={isLoading}
                                        />
                                        {signInForm.formState.errors.email && (
                                            <p className="text-sm text-destructive">
                                                {signInForm.formState.errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signin-password">Password</Label>
                                        <Input
                                            id="signin-password"
                                            type="password"
                                            placeholder="••••••••"
                                            {...signInForm.register('password')}
                                            disabled={isLoading}
                                        />
                                        {signInForm.formState.errors.password && (
                                            <p className="text-sm text-destructive">
                                                {signInForm.formState.errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full gradient-instagram text-white hover:opacity-90"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Signing In...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Sign Up Form */}
                            <TabsContent value="signup">
                                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name">Full Name</Label>
                                        <Input
                                            id="signup-name"
                                            type="text"
                                            placeholder="John Doe"
                                            {...signUpForm.register('fullName')}
                                            disabled={isLoading}
                                        />
                                        {signUpForm.formState.errors.fullName && (
                                            <p className="text-sm text-destructive">
                                                {signUpForm.formState.errors.fullName.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            {...signUpForm.register('email')}
                                            disabled={isLoading}
                                        />
                                        {signUpForm.formState.errors.email && (
                                            <p className="text-sm text-destructive">
                                                {signUpForm.formState.errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            placeholder="••••••••"
                                            {...signUpForm.register('password')}
                                            disabled={isLoading}
                                        />
                                        {signUpForm.formState.errors.password && (
                                            <p className="text-sm text-destructive">
                                                {signUpForm.formState.errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-confirm">Confirm Password</Label>
                                        <Input
                                            id="signup-confirm"
                                            type="password"
                                            placeholder="••••••••"
                                            {...signUpForm.register('confirmPassword')}
                                            disabled={isLoading}
                                        />
                                        {signUpForm.formState.errors.confirmPassword && (
                                            <p className="text-sm text-destructive">
                                                {signUpForm.formState.errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full gradient-funky text-white hover:opacity-90"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating Account...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Social Media Icons */}
                <div className="flex justify-center space-x-4 opacity-50">
                    <Instagram className="w-6 h-6" />
                    <Facebook className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
