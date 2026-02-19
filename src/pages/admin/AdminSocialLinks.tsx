import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSocialLinks, useUpdateSocialLink } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, Save, Instagram, Twitter, Facebook, Youtube, MessageCircle, Link as LinkIcon } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  whatsapp: MessageCircle,
};

export default function AdminSocialLinks() {
  const { data: socialLinks, isLoading } = useSocialLinks();
  const updateSocialLink = useUpdateSocialLink();
  const { toast } = useToast();
  const [localData, setLocalData] = useState<Record<string, { url: string; is_active: boolean }>>({});

  useEffect(() => {
    if (socialLinks) {
      const initial: Record<string, { url: string; is_active: boolean }> = {};
      socialLinks.forEach((link) => {
        initial[link.id] = { url: link.url, is_active: link.is_active };
      });
      setLocalData(initial);
    }
  }, [socialLinks]);

  const handleChange = (id: string, field: "url" | "is_active", value: string | boolean) => {
    setLocalData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id: string) => {
    const data = localData[id];
    if (!data) return;

    try {
      await updateSocialLink.mutateAsync({ id, ...data });
      toast({ title: "Saved", description: "Social link updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update." });
    }
  };

  const handleSaveAll = async () => {
    try {
      for (const id of Object.keys(localData)) {
        await updateSocialLink.mutateAsync({ id, ...localData[id] });
      }
      toast({ title: "All links saved" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Social Links">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Social Links" description="Configure your social media profiles">
      <div className="space-y-4 max-w-2xl">
        {socialLinks?.map((link) => {
          const Icon = iconMap[link.icon?.toLowerCase() || ""] || LinkIcon;
          const data = localData[link.id] || { url: link.url, is_active: link.is_active };
          
          return (
            <Card key={link.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{link.platform}</Label>
                      <Switch
                        checked={data.is_active}
                        onCheckedChange={(checked) => handleChange(link.id, "is_active", checked)}
                      />
                    </div>
                    <Input
                      value={data.url}
                      onChange={(e) => handleChange(link.id, "url", e.target.value)}
                      placeholder={`https://${link.platform.toLowerCase()}.com/yourhandle`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Button onClick={handleSaveAll} disabled={updateSocialLink.isPending} className="w-full">
          {updateSocialLink.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save All Links
        </Button>
      </div>
    </AdminLayout>
  );
}
