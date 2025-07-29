import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useSEO from '@/hooks/useSEO';
const ContactAdmin = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const seoData = useSEO({
    title: "Contact Shazam Parking - Get Support & Help | Dubai Parking Platform",
    description: "Need help with Shazam Parking? Contact our support team at support@shazam.ae or use our contact form. Get assistance with parking bookings, listing spaces, and account issues.",
    keywords: "Shazam Parking contact, parking support Dubai, customer service, help desk, parking assistance, support@shazam.ae",
    url: "/contact-admin"
  });
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to contact admin",
        variant: "destructive"
      });
      return;
    }
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both subject and message",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Insert message into database
      const {
        error
      } = await supabase.from('user_messages').insert([{
        user_id: user.id,
        from_admin: false,
        subject: subject,
        message: message
      }]);
      if (error) throw error;

      // Send notification to admin
      await supabase.functions.invoke('send-message-notification', {
        body: {
          userEmail: user.email,
          userName: user.email,
          subject: subject,
          message: message
        }
      });
      toast({
        title: "Message sent successfully",
        description: "Your message has been sent to the admin. You'll receive a response in your inbox."
      });
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again or contact support directly",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-background">
      {seoData}
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link to="/my-account" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Account
            </Link>
          </div>

          <div className="text-center mb-8">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Contact Support</h1>
            <p className="text-muted-foreground text-lg mb-4">
              We're here to help! Send us a message through the form below or email us directly at{' '}
              <a href="mailto:support@shazam.ae" className="text-primary hover:underline font-medium">support@shazamparking.ae</a>
            </p>
            <p className="text-sm text-muted-foreground">
              Have any questions? Feel free to send a direct email to{' '}
              <a href="mailto:support@shazam.ae" className="text-primary hover:underline">
                support@shazam.ae
              </a>{' '}
              and we'll get back to you as soon as possible.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="What is this message about?" required className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Please describe your question, issue, or request in detail..." rows={8} required className="mt-2" />
                </div>

                {user ? <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Signed in as:</strong> {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Our support team will respond to your message in your account inbox.
                    </p>
                  </div> : <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                    <p className="text-sm text-destructive">
                      You must be signed in to contact admin. Please <a href="/auth" className="underline">sign in</a> first.
                    </p>
                  </div>}

                <Button type="submit" disabled={isSubmitting || !user} className="w-full">
                  {isSubmitting ? "Sending..." : <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>}
                </Button>
              </form>
            </CardContent>
          </Card>

          
        </div>
      </div>

      <Footer />
    </div>;
};
export default ContactAdmin;