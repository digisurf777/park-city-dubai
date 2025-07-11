import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Feedback = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send feedback",
        variant: "destructive",
      });
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both subject and message",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert feedback message into database
      const { error } = await supabase
        .from('user_messages')
        .insert([{
          user_id: user.id,
          from_admin: false,
          subject: `[FEEDBACK] ${subject}`,
          message: message,
        }]);

      if (error) throw error;

      // Send notification to admin
      await supabase.functions.invoke('send-message-notification', {
        body: {
          subject: `New Feedback: ${subject}`,
          message: `New feedback from user: ${user.email}

Subject: ${subject}

Message:
${message}`,
          userId: user.id,
          fromAdmin: false
        }
      });

      toast({
        title: "Feedback sent successfully",
        description: "Thank you for your feedback! We'll review it and get back to you soon.",
      });

      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: "Failed to send feedback",
        description: "Please try again or contact support directly",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Send Feedback</h1>
            <p className="text-muted-foreground">
              We value your feedback! Let us know about your experience, suggestions, or any issues you've encountered.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your feedback"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please share your feedback, suggestions, or report any issues..."
                    rows={8}
                    required
                    className="mt-2"
                  />
                </div>

                {user ? (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Signed in as:</strong> {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll send our response to your inbox on this platform.
                    </p>
                  </div>
                ) : (
                  <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                    <p className="text-sm text-destructive">
                      You must be signed in to send feedback. Please <a href="/auth" className="underline">sign in</a> first.
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isSubmitting || !user}
                  className="w-full"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Need immediate assistance? Contact us at{' '}
              <a href="mailto:support@shazamparking.com" className="text-primary hover:underline">
                support@shazamparking.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Feedback;