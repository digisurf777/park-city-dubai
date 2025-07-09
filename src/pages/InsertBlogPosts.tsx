import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const InsertBlogPosts = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const insertPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('insert-blog-posts', {
        body: {}
      });
      if (error) {
        throw error;
      }

      setResult(data);
      toast({
        title: "Success!",
        description: `${data.count || 0} blog posts inserted successfully`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to insert blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Insert Blog Posts from ShazamParking.ae</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This will insert the blog posts from the original ShazamParking.ae website 
              with exact dates, content, and images.
            </p>
            
            <Button 
              onClick={insertPosts} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Inserting..." : "Insert Blog Posts"}
            </Button>

            {result && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Result:</h3>
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default InsertBlogPosts;