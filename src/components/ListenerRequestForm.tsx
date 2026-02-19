import { useState, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const nameExamples = ["Ola", "Ayomide", "Seun", "Mariam", "Chidi", "Emeka", "Fatima", "Kofi", "Amara"];
const locationExamples = ["Lagos", "Accra", "Texas", "Ibadan", "London", "Chicago", "Abuja", "New York", "Nairobi"];
const messageExamples = ["Request a song...", "Send a shoutout...", "Share your thoughts...", "Dedicate a song..."];

export function ListenerRequestForm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [namePlaceholder, setNamePlaceholder] = useState(nameExamples[0]);
  const [locationPlaceholder, setLocationPlaceholder] = useState(locationExamples[0]);
  const [messagePlaceholder, setMessagePlaceholder] = useState(messageExamples[0]);

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    let ni = 0, li = 0, mi = 0;
    intervals.push(setInterval(() => { ni = (ni + 1) % nameExamples.length; setNamePlaceholder(nameExamples[ni]); }, 2000));
    intervals.push(setInterval(() => { li = (li + 1) % locationExamples.length; setLocationPlaceholder(locationExamples[li]); }, 2500));
    intervals.push(setInterval(() => { mi = (mi + 1) % messageExamples.length; setMessagePlaceholder(messageExamples[mi]); }, 3000));
    return () => intervals.forEach(clearInterval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !message.trim()) { toast.error("Please fill in all fields"); return; }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("listener_requests").insert({ name: name.trim(), location: location.trim(), message: message.trim() });
      if (error) throw error;
      toast.success("Your request has been sent! 🎵");
      setName(""); setLocation(""); setMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send request. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="glass rounded-3xl p-6 md:p-8 border border-primary/20">
      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 font-display">
          Request a <span className="text-gold-shimmer">Song</span>
        </h3>
        <p className="text-muted-foreground text-sm">Send us your song requests, shoutouts, or just say hello!</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="request-name">Your Name</Label>
            <Input id="request-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={namePlaceholder} className="rounded-xl bg-muted/50" disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-location">Location</Label>
            <Input id="request-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={locationPlaceholder} className="rounded-xl bg-muted/50" disabled={isSubmitting} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="request-message">Your Message</Label>
          <Textarea id="request-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={messagePlaceholder} rows={4} className="rounded-xl bg-muted/50 resize-none" disabled={isSubmitting} />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl glow-gold-sm">
          {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending...</> : <><Send className="w-5 h-5 mr-2" />Send Request</>}
        </Button>
      </form>
    </div>
  );
}
