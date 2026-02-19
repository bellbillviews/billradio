import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/admin/FileUpload";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Image } from "lucide-react";

export default function AdminSettings() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  const getValue = (key: string) => {
    if (localSettings[key] !== undefined) return localSettings[key];
    return settings?.find((s) => s.setting_key === key)?.setting_value || "";
  };

  const getSettingId = (key: string) => settings?.find((s) => s.setting_key === key)?.id;

  const handleChange = (key: string, value: string) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    const keys = Object.keys(localSettings);
    for (const key of keys) {
      const id = getSettingId(key);
      if (id) {
        await updateSetting.mutateAsync({ id, setting_value: localSettings[key] });
      }
    }
    setLocalSettings({});
    toast({ title: "All settings saved", description: "Your changes have been saved successfully." });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Site Settings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const pageBackgrounds = [
    { key: "bg_image_home", label: "Home Page Hero" },
    { key: "bg_image_listen", label: "Listen Page Hero" },
    { key: "bg_image_shows", label: "Shows Page Hero" },
    { key: "bg_image_events", label: "Events Page Hero" },
    { key: "bg_image_contact", label: "Contact Page Hero" },
    { key: "bg_image_about", label: "About Page Hero" },
  ];

  const sectionBackgrounds = [
    { key: "bg_image_section_nowplaying", label: "Now Playing Section" },
    { key: "bg_image_section_shows", label: "Featured Shows Section" },
    { key: "bg_image_section_presenters", label: "Presenters Section" },
    { key: "bg_image_section_stats", label: "Stats Section" },
    { key: "bg_image_section_why", label: "Why Us Section" },
    { key: "bg_image_section_partner", label: "Partner CTA Section" },
    { key: "bg_image_section_request", label: "Song Request Section" },
    { key: "bg_image_section_about_broadcast", label: "About Broadcast Section" },
  ];

  return (
    <AdminLayout title="Site Settings" description="Configure your radio station branding and settings">
      <div className="space-y-6 max-w-2xl">
        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Configure your station name, slogan, and logo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Station Name</Label>
              <Input value={getValue("station_name")} onChange={(e) => handleChange("station_name", e.target.value)} placeholder="Bellbill Radio" />
            </div>
            <div className="space-y-2">
              <Label>Station Slogan</Label>
              <Input value={getValue("station_slogan")} onChange={(e) => handleChange("station_slogan", e.target.value)} placeholder="The Sound of Culture, Voice, and Music" />
            </div>
            <FileUpload value={getValue("logo_url")} onChange={(url) => handleChange("logo_url", url)} label="Station Logo" folder="logos" />
          </CardContent>
        </Card>

        {/* Stream URL */}
        <Card>
          <CardHeader>
            <CardTitle>Live Stream</CardTitle>
            <CardDescription>Configure your live audio stream URL (fallback)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Stream URL</Label>
              <Input value={getValue("stream_url")} onChange={(e) => handleChange("stream_url", e.target.value)} placeholder="https://stream.example.com/live.mp3" />
              <p className="text-xs text-muted-foreground">Fallback stream URL if Radio.co is not configured</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Configure contact details for your station</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input type="email" value={getValue("contact_email")} onChange={(e) => handleChange("contact_email", e.target.value)} placeholder="info@bellbillradio.com" />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input value={getValue("contact_phone")} onChange={(e) => handleChange("contact_phone", e.target.value)} placeholder="+234 800 000 0000" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input value={getValue("whatsapp_number")} onChange={(e) => handleChange("whatsapp_number", e.target.value)} placeholder="+234 800 000 0000" />
            </div>
          </CardContent>
        </Card>

        {/* Page Hero Background Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Image className="w-5 h-5 text-primary" />Page Hero Backgrounds</CardTitle>
            <CardDescription>Upload images or paste URLs for each page hero. Pick from computer or paste external link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pageBackgrounds.map((bg) => (
              <FileUpload
                key={bg.key}
                value={getValue(bg.key)}
                onChange={(url) => handleChange(bg.key, url)}
                label={bg.label}
                folder="backgrounds"
                placeholder="Paste image URL or upload"
              />
            ))}
          </CardContent>
        </Card>

        {/* Section Background Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Image className="w-5 h-5 text-primary" />Section Backgrounds</CardTitle>
            <CardDescription>Set background images for individual sections across the site. Leave empty for default gradient.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectionBackgrounds.map((bg) => (
              <FileUpload
                key={bg.key}
                value={getValue(bg.key)}
                onChange={(url) => handleChange(bg.key, url)}
                label={bg.label}
                folder="backgrounds"
                placeholder="Paste image URL or upload"
              />
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSaveAll}
          disabled={updateSetting.isPending || Object.keys(localSettings).length === 0}
          className="w-full"
        >
          {updateSetting.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save All Changes
        </Button>
      </div>
    </AdminLayout>
  );
}
