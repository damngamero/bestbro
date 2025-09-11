
"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import Link from "next/link"

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
import { Eye, EyeOff, KeyRound, LoaderCircle, Moon, Sun } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { Separator } from "./ui/separator"

type ModelId = 'googleai/gemini-2.5-flash' | 'googleai/gemini-2.5-pro';

interface SettingsDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    apiKey: string | null;
    onApiKeyChange: (apiKey: string | null) => void;
    model: ModelId;
    onModelChange: (model: ModelId) => void;
}

const PASSWORD_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

export function SettingsDialog({ isOpen, onOpenChange, apiKey, onApiKeyChange, model, onModelChange }: SettingsDialogProps) {
  const { setTheme, theme } = useTheme()
  const { user, sendPasswordReset } = useAuth();
  const [localApiKey, setLocalApiKey] = useState(apiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [remainingCooldown, setRemainingCooldown] = useState(0);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLocalApiKey(apiKey || "");
    setIsApiKeyMissing(!apiKey);
    
    const storedCooldown = localStorage.getItem('passwordCooldownEnd');
    if (storedCooldown) {
      const endTime = parseInt(storedCooldown, 10);
      if (endTime > Date.now()) {
        setCooldownEndTime(endTime);
      } else {
        localStorage.removeItem('passwordCooldownEnd');
      }
    }
  }, [apiKey, isOpen]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownEndTime) {
      const updateRemaining = () => {
        const remaining = Math.max(0, cooldownEndTime - Date.now());
        setRemainingCooldown(remaining);
        if (remaining === 0) {
          setCooldownEndTime(null);
          localStorage.removeItem('passwordCooldownEnd');
          clearInterval(interval);
        }
      };
      updateRemaining();
      interval = setInterval(updateRemaining, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownEndTime]);

  const handleSave = () => {
    if (localApiKey) {
        localStorage.setItem("googleApiKey", localApiKey);
        onApiKeyChange(localApiKey);
        toast({
            title: 'Settings Saved',
            description: 'Your preferences have been updated.',
        });
    } else {
        localStorage.removeItem("googleApiKey");
        onApiKeyChange(null);
         toast({
            title: 'API Key Removed',
            description: 'Your API Key has been removed. The app will not function until a new one is added.',
        });
    }
    onOpenChange(false);
  }

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    setIsChangingPassword(true);
    try {
        await sendPasswordReset(user.email);
        toast({
            title: "Email Sent",
            description: `A password reset link has been sent to ${user.email}.`,
        });
        const endTime = Date.now() + PASSWORD_COOLDOWN_MS;
        setCooldownEndTime(endTime);
        localStorage.setItem('passwordCooldownEnd', String(endTime));
    } catch (e) {
        // Error toast is handled inside the hook, so no need to show one here.
    } finally {
        setIsChangingPassword(false);
    }
  }
  
  const formatCooldown = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your app preferences.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <div className="space-y-4 py-4">
              {user && (
                <>
                    <div className="space-y-2">
                        <Label>Account</Label>
                        <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                            {user.email}
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleChangePassword}
                            disabled={isChangingPassword || !!cooldownEndTime}
                        >
                            {isChangingPassword ? <LoaderCircle className="animate-spin mr-2 h-4 w-4"/> : <KeyRound className="mr-2 h-4 w-4"/>}
                            {cooldownEndTime ? `Retry in ${formatCooldown(remainingCooldown)}` : 'Change Password'}
                        </Button>
                    </div>
                    <Separator />
                </>
              )}
              <div className="space-y-2">
                  <Label htmlFor="api-key">
                    API Key
                  </Label>
                  <div className="relative">
                     <Input 
                        id="api-key" 
                        type={showApiKey ? "text" : "password"}
                        value={localApiKey} 
                        onChange={(e) => setLocalApiKey(e.target.value)}
                        className={cn(
                          "pr-10",
                          isApiKeyMissing && "ring-2 ring-offset-2 ring-destructive focus-visible:ring-destructive"
                        )}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute inset-y-0 right-0 h-full px-3"
                      onClick={() => setShowApiKey(s => !s)}
                    >
                      {showApiKey ? <EyeOff /> : <Eye />}
                      <span className="sr-only">{showApiKey ? 'Hide API Key' : 'Show API Key'}</span>
                    </Button>
                  </div>
                <p className="text-xs text-muted-foreground px-1">
                  Get a key from{" "}
                  <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline"
                  >
                      Google AI Studio
                  </a>.{" "}
                </p>
              </div>

              <div>
                 <Label>Model</Label>
                 <RadioGroup
                    value={model}
                    onValueChange={(value: string) => onModelChange(value as ModelId)}
                    className="flex gap-4 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="googleai/gemini-2.5-pro" id="gemini-pro" />
                        <Label htmlFor="gemini-pro">Pro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="googleai/gemini-2.5-flash" id="gemini-flash" />
                        <Label htmlFor="gemini-flash">Flash</Label>
                    </div>
                  </RadioGroup>
              </div>

              <div>
                <Label>
                    Theme
                </Label>
                 <div className="flex gap-2 pt-2">
                    <Button variant={theme === 'light' ? 'default' : 'outline'} size="icon" onClick={() => setTheme("light")}>
                        <Sun className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                    <Button variant={theme === 'dark' ? 'default' : 'outline'} size="icon" onClick={() => setTheme("dark")}>
                        <Moon className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Save Changes</Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="about">
            <div className="py-4 space-y-4">
              <p className="text-sm text-foreground">
                This application is made by{' '}
                <Link href="/creations" className="font-bold underline hover:text-primary transition-colors" onClick={() => onOpenChange(false)}>
                    TheVibeCod3r
                </Link>
                {' '}to showcase the power of AI in everyday applications.
              </p>
              <p className="text-sm text-muted-foreground">
                Built with Next.js, Genkit, and ShadCN UI.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
