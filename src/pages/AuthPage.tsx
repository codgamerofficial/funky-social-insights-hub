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
    const { signIn, signUp, signInWithGoogle } = useAuth();
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

                {/* Social Auth */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    type="button"
                    className="w-full btn-3d"
                    onClick={() => signInWithGoogle()}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    )}
                    Google
                </Button>
            </div>
        </div>
    );
};

export default AuthPage;
