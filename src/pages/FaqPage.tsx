import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useSiteSettings } from "@/hooks/useSiteData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqPage() {
  const { data: settings, isLoading } = useSiteSettings();

  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const stationName = getSetting("station_name") || "Bellbill Views";
  const faqContent = getSetting("faq_content");

  // Default FAQs if none set in admin
  const defaultFaqs = [
    {
      question: "How can I listen to the radio?",
      answer: `You can listen to ${stationName} by visiting our Listen page and clicking the play button. Our stream is available 24/7.`
    },
    {
      question: "How do I request a song?",
      answer: "Visit our Listen page and fill out the listener request form with your name, location, and message. Our presenters will try to accommodate your requests!"
    },
    {
      question: "Can I become a presenter?",
      answer: "We're always looking for talented voices! Contact us through our Contact page with your demo reel and experience."
    },
    {
      question: "Is the radio free to listen?",
      answer: "Yes! Our radio stream is completely free to listen. We support ourselves through advertising and partnerships."
    },
    {
      question: "What kind of music do you play?",
      answer: "We play a diverse mix of African music, including Afrobeats, Highlife, Gospel, and more. Check our Shows page for specific programming."
    },
    {
      question: "How can I advertise with you?",
      answer: "Visit our Billboard page to learn about advertising opportunities, or contact us directly for custom packages."
    }
  ];

  // Parse FAQ content if it exists (expecting JSON format or HTML)
  let parsedFaqs = defaultFaqs;
  if (faqContent) {
    try {
      parsedFaqs = JSON.parse(faqContent);
    } catch {
      // If not JSON, use default and show custom content below
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Frequently Asked <span className="text-primary">Questions</span>
              </h1>
              <p className="text-muted-foreground">
                Find answers to common questions about {stationName}
              </p>
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {parsedFaqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="bg-card border border-border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left text-foreground hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            {/* If custom HTML content exists and couldn't be parsed as JSON */}
            {faqContent && !parsedFaqs.length && (
              <div 
                className="prose prose-invert max-w-none text-muted-foreground mt-8"
                dangerouslySetInnerHTML={{ __html: faqContent }}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
