import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useSiteSettings } from "@/hooks/useSiteData";

export default function TermsPage() {
  const { data: settings, isLoading } = useSiteSettings();

  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const stationName = getSetting("station_name") || "Bellbill Views";
  const termsContent = getSetting("terms_of_service");

  const defaultContent = `
    <h2>Terms of Service</h2>
    <p>Last updated: ${new Date().toLocaleDateString()}</p>
    
    <h3>1. Acceptance of Terms</h3>
    <p>By accessing and using ${stationName}, you accept and agree to be bound by these Terms of Service.</p>
    
    <h3>2. Use of Service</h3>
    <p>You agree to use our radio streaming service for lawful purposes only and in accordance with these Terms.</p>
    
    <h3>3. Intellectual Property</h3>
    <p>All content, including music, shows, and branding, is the property of ${stationName} or its licensors.</p>
    
    <h3>4. User Content</h3>
    <p>By submitting requests or messages, you grant us the right to use, display, and broadcast your submissions.</p>
    
    <h3>5. Disclaimer</h3>
    <p>Our service is provided "as is" without warranties of any kind, either express or implied.</p>
    
    <h3>6. Changes to Terms</h3>
    <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of changes.</p>
  `;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Terms of <span className="text-primary">Service</span>
            </h1>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            ) : (
              <div 
                className="prose prose-invert max-w-none text-muted-foreground
                  prose-headings:text-foreground prose-headings:font-semibold
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-ul:my-4 prose-li:my-1"
                dangerouslySetInnerHTML={{ 
                  __html: termsContent || defaultContent 
                }}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
