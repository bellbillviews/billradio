import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useSiteSettings } from "@/hooks/useSiteData";

export default function PrivacyPage() {
  const { data: settings, isLoading } = useSiteSettings();

  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const stationName = getSetting("station_name") || "Bellbill Views";
  const privacyContent = getSetting("privacy_policy");

  const defaultContent = `
    <h2>Privacy Policy</h2>
    <p>Last updated: ${new Date().toLocaleDateString()}</p>
    
    <h3>1. Information We Collect</h3>
    <p>We collect information you provide directly to us, such as when you submit a listener request, contact us, or interact with our services.</p>
    
    <h3>2. How We Use Your Information</h3>
    <p>We use the information we collect to operate, maintain, and improve our radio services, respond to your requests, and communicate with you.</p>
    
    <h3>3. Information Sharing</h3>
    <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
    
    <h3>4. Cookies and Tracking</h3>
    <p>We may use cookies and similar tracking technologies to enhance your experience on our platform.</p>
    
    <h3>5. Contact Us</h3>
    <p>If you have questions about this Privacy Policy, please contact us through our contact page.</p>
  `;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Privacy <span className="text-primary">Policy</span>
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
                  __html: privacyContent || defaultContent 
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
