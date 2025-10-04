
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { Eye, EyeOff, LoaderCircle, MailCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AuthDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function AuthDialog({ isOpen, onOpenChange }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail, sendPasswordReset } = useAuth();
  const { toast } = useToast();
  
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPass, setSignInPass] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPass, setSignUpPass] = useState("");
  const [signUpName, setSignUpName] = useState("");

  const [showSignInPass, setShowSignInPass] = useState(false);
  const [showSignUpPass, setShowSignUpPass] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
        const lastEmail = localStorage.getItem('lastSignInEmail');
        if(lastEmail) {
            setSignInEmail(lastEmail);
        }
    }
  }, [isOpen]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSignInError(null);
    setResetEmailSent(false);
    try {
        await signInWithEmail(signInEmail, signInPass);
        localStorage.setItem('lastSignInEmail', signInEmail);
        onOpenChange(false);
    } catch (e: any) {
        if (e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
            setSignInError("Invalid email or password.");
        } else if (e.message === "Email not verified") {
            setSignInError("Please verify your email before signing in.");
        } else {
            setSignInError("An unexpected error occurred. Please try again.");
        }
    } finally {
        setIsLoading(false);
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSignUpError(null);
    try {
        await signUpWithEmail(signUpEmail, signUpPass, signUpName);
        toast({
            title: "Check your email!",
            description: "A verification link has been sent to your email address to finish account creation.",
            duration: 8000,
        });
        onOpenChange(false);
    } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
            setSignUpError("An account with this email already exists. Please sign in or use a different email.");
        } else if (e.message === 'Failed to send verification email.') {
            setSignUpError("Couldn't send verification email. Please try again or use a different email.");
        } else {
            setSignUpError(e.message || "An unexpected error occurred. Please try again.");
        }
    } finally {
        setIsLoading(false);
    }
  }
  
  const handleForgotPassword = async () => {
    if (!signInEmail) {
        setSignInError("Please enter your email address first.");
        return;
    }
    setIsLoading(true);
    setSignInError(null);
    setResetEmailSent(false);
    try {
        await sendPasswordReset(signInEmail);
        setResetEmailSent(true);
    } catch(e: any) {
        // Error is handled inside the hook to prevent leaking user existence.
        // We still show the success UI.
        setResetEmailSent(true);
    } finally {
        setIsLoading(false);
    }
  }

  const handleTabChange = () => {
    setSignInError(null);
    setSignUpError(null);
    setResetEmailSent(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to RecipeSavvy</DialogTitle>
          <DialogDescription>
            Sign in to save your recipes and preferences.
          </DialogDescription>
        </DialogHeader>
        {resetEmailSent ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
                <MailCheck className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Check Your Inbox</h3>
                <p className="text-muted-foreground">If an account with <span className="font-medium text-foreground">{signInEmail}</span> exists, we've sent a password reset link.</p>
            </div>
        ) : (
        <Tabs defaultValue="signin" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" placeholder="m@example.com" required value={signInEmail} onChange={e => setSignInEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                        <Input 
                            id="signin-password" 
                            type={showSignInPass ? "text" : "password"}
                            required 
                            value={signInPass} 
                            onChange={e => setSignInPass(e.target.value)} 
                        />
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setShowSignInPass(s => !s)}
                        >
                            {showSignInPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                    </div>
                </div>
                {signInError && (
                    <div className="text-sm text-destructive flex justify-between items-center">
                        <span>{signInError}</span>
                        {(signInError.includes("password") || signInError.includes("found")) && (
                           <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={handleForgotPassword}>
                                Forgot Password?
                           </Button>
                        )}
                    </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <LoaderCircle className="animate-spin" />}
                    {!isLoading && "Sign In"}
                </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input id="signup-name" type="text" placeholder="Your Name" required value={signUpName} onChange={e => setSignUpName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="m@example.com" required value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-password">Password (6+ characters)</Label>
                    <div className="relative">
                        <Input 
                            id="signup-password" 
                            type={showSignUpPass ? "text" : "password"} 
                            required 
                            minLength={6} 
                            value={signUpPass} 
                            onChange={e => setSignUpPass(e.target.value)} 
                        />
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setShowSignUpPass(s => !s)}
                        >
                            {showSignUpPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                    </div>
                </div>
                 {signUpError && (
                    <div className="text-sm text-destructive">
                        {signUpError}
                    </div>
                )}
                 <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <LoaderCircle className="animate-spin" />}
                    {!isLoading && "Create Account"}
                </Button>
            </form>
          </TabsContent>
        </Tabs>
        )}

      </DialogContent>
    </Dialog>
  )
}
