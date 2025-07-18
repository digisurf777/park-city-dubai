
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, User, Building, Mail } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '', userType: 'seeker' });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recaptchaToken) {
      toast.error('Proszę wypełnić weryfikację reCAPTCHA');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signIn(loginForm.email, loginForm.password);
      
      if (error) {
        if (error.message.includes('Potwierdź swój adres e-mail')) {
          toast.error(error.message, {
            duration: 5000,
            description: 'Sprawdź swoją skrzynkę odbiorczą i kliknij link potwierdzający.'
          });
        } else {
          toast.error(error.message || 'Błąd podczas logowania');
        }
      } else {
        toast.success('Zalogowano pomyślnie!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Wystąpił błąd podczas logowania');
    } finally {
      setLoading(false);
      // Reset reCAPTCHA
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Hasła nie są zgodne');
      return;
    }
    
    if (signupForm.password.length < 6) {
      toast.error('Hasło musi mieć co najmniej 6 znaków');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(signupForm.email, signupForm.password, signupForm.fullName, signupForm.userType);
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Ten adres e-mail jest już zarejestrowany');
        } else {
          toast.error(error.message || 'Błąd podczas rejestracji');
        }
      } else {
        toast.success('Konto utworzone pomyślnie!', {
          duration: 6000,
          description: 'Sprawdź swoją skrzynkę odbiorczą i potwierdź adres e-mail przed zalogowaniem.'
        });
        setSignupForm({ email: '', password: '', confirmPassword: '', fullName: '', userType: 'seeker' });
        
        // Show additional info about email confirmation
        setTimeout(() => {
          toast.info('Ważne!', {
            duration: 8000,
            description: 'Musisz potwierdzić swój adres e-mail zanim będziesz mógł się zalogować. Sprawdź też folder spam.'
          });
        }, 2000);
      }
    } catch (error) {
      toast.error('Wystąpił błąd podczas rejestracji');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        toast.error(error.message || 'Błąd podczas wysyłania e-maila resetującego');
      } else {
        toast.success('E-mail z linkiem do resetowania hasła został wysłany!', {
          duration: 6000,
          description: 'Sprawdź swoją skrzynkę odbiorczą i kliknij link, aby zresetować hasło.'
        });
        setResetEmail('');
        setShowResetForm(false);
      }
    } catch (error) {
      toast.error('Wystąpił błąd podczas wysyłania e-maila resetującego');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 animate-zoom-slow">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Witamy w Shazam Parking</CardTitle>
          <CardDescription className="text-center">
            Zaloguj się do swojego konta lub utwórz nowe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Logowanie</TabsTrigger>
              <TabsTrigger value="signup">Rejestracja</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Wprowadź swój e-mail"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Hasło</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Wprowadź swoje hasło"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                
                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key - replace with your actual site key
                    onChange={(token) => setRecaptchaToken(token)}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading || !recaptchaToken}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logowanie...
                    </>
                  ) : (
                    'Zaloguj się'
                  )}
                </Button>
                
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm p-0"
                    onClick={() => setShowResetForm(!showResetForm)}
                  >
                    Zapomniałeś hasła?
                  </Button>
                </div>
                
                {showResetForm && (
                  <form onSubmit={handleResetPassword} className="mt-4 space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">E-mail do resetowania hasła</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Wprowadź swój e-mail"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={resetLoading}>
                        {resetLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Wysyłanie...
                          </>
                        ) : (
                          'Wyślij e-mail resetujący'
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowResetForm(false)}
                      >
                        Anuluj
                      </Button>
                    </div>
                  </form>
                )}
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Potwierdzenie e-maila wymagane</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Po rejestracji musisz potwierdzić swój adres e-mail przed zalogowaniem.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-name">Imię i nazwisko</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Wprowadź swoje imię i nazwisko"
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Adres e-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Wprowadź swój adres e-mail"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Hasło</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Wybierz hasło (min. 6 znaków)"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Potwierdź hasło</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Potwierdź swoje hasło"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user-type">Jestem:</Label>
                  <Select value={signupForm.userType} onValueChange={(value) => setSignupForm({ ...signupForm, userType: value })}>
                    <SelectTrigger id="user-type">
                      <SelectValue placeholder="Wybierz swoją rolę" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seeker">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Szukam miejsca parkingowego
                        </div>
                      </SelectItem>
                      <SelectItem value="owner">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Właściciel miejsca parkingowego
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Tworzenie konta...
                    </>
                  ) : (
                    'Utwórz konto'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
