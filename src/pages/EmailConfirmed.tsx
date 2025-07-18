
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmailConfirmed = () => {
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'signup') {
          setError('Nieprawidłowy link potwierdzający');
          setLoading(false);
          return;
        }

        // Verify the token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          console.error('Verification error:', error);
          setError('Link potwierdzający wygasł lub jest nieprawidłowy');
        } else if (data.user) {
          setConfirmed(true);
          
          // Update the profile to mark email as confirmed
          try {
            await supabase
              .from('profiles')
              .update({ email_confirmed_at: new Date().toISOString() })
              .eq('user_id', data.user.id);
          } catch (profileError) {
            console.error('Error updating profile:', profileError);
            // Don't fail confirmation if profile update fails
          }
        }
      } catch (err) {
        console.error('Confirmation error:', err);
        setError('Wystąpił błąd podczas potwierdzania adresu e-mail');
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);

  const handleLoginRedirect = () => {
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Potwierdzanie adresu e-mail...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {confirmed ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                E-mail potwierdzony!
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                Potwierdzenie nieudane
              </>
            )}
          </CardTitle>
          <CardDescription>
            {confirmed 
              ? "Twój adres e-mail został pomyślnie potwierdzony."
              : "Wystąpił problem z potwierdzeniem adresu e-mail."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {confirmed ? (
            <>
              <p className="text-sm text-muted-foreground">
                Twój adres e-mail został potwierdzony. Możesz teraz zalogować się do swojego konta.
              </p>
              <Button onClick={handleLoginRedirect} className="w-full">
                Przejdź do logowania
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-red-600">
                {error || "Link potwierdzający jest nieprawidłowy lub wygasł."}
              </p>
              <p className="text-sm text-muted-foreground">
                Spróbuj zarejestrować się ponownie lub skontaktuj się z obsługą, jeśli problem się powtarza.
              </p>
              <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
                Powrót do rejestracji
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmed;
