import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, MousePointer, Download, Calendar, DollarSign, Globe } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/admin/FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface BillboardAd {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  advertiser_name: string;
  advertiser_email: string | null;
  advertiser_phone: string | null;
  ad_type: string;
  placement: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  is_auto_end: boolean;
  priority: number;
  price: number | null;
  currency: string;
  notes: string | null;
  created_at: string;
}

interface AdAnalytics {
  id: string;
  ad_id: string;
  event_type: string;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  created_at: string;
}

interface AdNetwork {
  id: string;
  name: string;
  network_type: string;
  publisher_id: string | null;
  slot_ids: Record<string, string>;
  is_active: boolean;
  placement: string;
  priority: number;
  config: Record<string, unknown>;
}

const AD_TYPES = [
  { value: "banner", label: "Banner (Large)" },
  { value: "sidebar", label: "Sidebar (Small)" },
  { value: "native", label: "Native (In-content)" },
  { value: "popup", label: "Popup/Modal" },
];

const PLACEMENTS = [
  { value: "homepage", label: "Homepage" },
  { value: "listen", label: "Listen Page" },
  { value: "shows", label: "Shows Page" },
  { value: "billboard", label: "Billboard Page" },
  { value: "all", label: "All Pages" },
];

const NETWORK_TYPES = [
  { value: "adsense", label: "Google AdSense" },
  { value: "adsterra", label: "Adsterra" },
  { value: "propellerads", label: "PropellerAds" },
  { value: "custom", label: "Custom Code" },
];

export default function AdminBillboard() {
  const queryClient = useQueryClient();
  const [editingAd, setEditingAd] = useState<BillboardAd | null>(null);
  const [editingNetwork, setEditingNetwork] = useState<AdNetwork | null>(null);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [isNetworkDialogOpen, setIsNetworkDialogOpen] = useState(false);
  const [selectedAdForStats, setSelectedAdForStats] = useState<string | null>(null);

  // Fetch ads
  const { data: ads, isLoading: adsLoading } = useQuery({
    queryKey: ["admin_billboard_ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billboard_ads")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Auto-end check: deactivate expired ads
      const now = new Date();
      const expiredAds = (data || []).filter(
        ad => ad.is_auto_end && ad.end_date && new Date(ad.end_date) < now && ad.is_active
      );
      if (expiredAds.length > 0) {
        for (const ad of expiredAds) {
          await supabase.from("billboard_ads").update({ is_active: false }).eq("id", ad.id);
        }
        // Re-fetch after deactivation
        const { data: refreshed } = await supabase
          .from("billboard_ads")
          .select("*")
          .order("priority", { ascending: false })
          .order("created_at", { ascending: false });
        return refreshed as BillboardAd[];
      }

      return data as BillboardAd[];
    },
    refetchInterval: 5000,
  });

  // Fetch ad networks
  const { data: networks, isLoading: networksLoading } = useQuery({
    queryKey: ["admin_ad_networks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_networks")
        .select("*")
        .order("priority", { ascending: false });
      if (error) throw error;
      return data as AdNetwork[];
    },
    refetchInterval: 5000,
  });

  // Fetch analytics - for specific ad or all ads
  const { data: analytics } = useQuery({
    queryKey: ["ad_analytics", selectedAdForStats],
    queryFn: async () => {
      let query = supabase.from("ad_analytics").select("*").order("created_at", { ascending: false }).limit(5000);
      if (selectedAdForStats && selectedAdForStats !== "all") {
        query = query.eq("ad_id", selectedAdForStats);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as AdAnalytics[];
    },
    enabled: !!selectedAdForStats,
  });

  // Mutations for ads
  const saveAdMutation = useMutation({
    mutationFn: async (ad: Partial<BillboardAd>) => {
      const { id, ...adData } = ad;
      if (id) {
        const { error } = await supabase.from("billboard_ads").update(adData).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("billboard_ads").insert(adData as { advertiser_name: string; title: string });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_billboard_ads"] });
      toast.success("Ad saved successfully");
      setIsAdDialogOpen(false);
      setEditingAd(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("billboard_ads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_billboard_ads"] });
      toast.success("Ad deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutations for networks
  const saveNetworkMutation = useMutation({
    mutationFn: async (network: Partial<AdNetwork>) => {
      const { id, ...networkData } = network;
      const dbData = {
        name: networkData.name,
        network_type: networkData.network_type,
        publisher_id: networkData.publisher_id,
        is_active: networkData.is_active,
        placement: networkData.placement,
        priority: networkData.priority,
        slot_ids: JSON.parse(JSON.stringify(networkData.slot_ids || {})),
        config: JSON.parse(JSON.stringify(networkData.config || {})),
      };
      if (id) {
        const { error } = await supabase.from("ad_networks").update(dbData).eq("id", id);
        if (error) throw error;
      } else {
        if (!dbData.name || !dbData.network_type) throw new Error("Name and network type are required");
        const { error } = await supabase.from("ad_networks").insert({
          name: dbData.name,
          network_type: dbData.network_type,
          publisher_id: dbData.publisher_id,
          is_active: dbData.is_active,
          placement: dbData.placement,
          priority: dbData.priority,
          slot_ids: dbData.slot_ids,
          config: dbData.config,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_ad_networks"] });
      toast.success("Ad network saved");
      setIsNetworkDialogOpen(false);
      setEditingNetwork(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteNetworkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ad_networks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_ad_networks"] });
      toast.success("Ad network deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  // Calculate stats for a specific ad or all
  const getAdStats = (adId: string) => {
    const adAnalytics = adId === "all" 
      ? (analytics || [])
      : (analytics || []).filter(a => a.ad_id === adId);
    const views = adAnalytics.filter(a => a.event_type === "view").length;
    const clicks = adAnalytics.filter(a => a.event_type === "click").length;
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : "0";
    return { views, clicks, ctr };
  };

  // Download stats as PDF
  const downloadStatsPDF = (ad: BillboardAd | null) => {
    const isAll = !ad;
    const title = isAll ? "All Advertisements" : ad.title;
    const stats = getAdStats(isAll ? "all" : ad.id);
    const adAnalytics = analytics || [];
    
    // Group by device, browser, country
    const devices: Record<string, number> = {};
    const browsers: Record<string, number> = {};
    const countries: Record<string, number> = {};
    
    adAnalytics.forEach(a => {
      if (a.device_type) devices[a.device_type] = (devices[a.device_type] || 0) + 1;
      if (a.browser) browsers[a.browser] = (browsers[a.browser] || 0) + 1;
      if (a.country) countries[a.country] = (countries[a.country] || 0) + 1;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ad Statistics - ${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #5435ac; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #5435ac; }
          .logo span { color: #f7b322; }
          h1 { color: #5435ac; margin: 20px 0 10px; }
          .subtitle { color: #666; font-size: 14px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
          .stat-box { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #5435ac; }
          .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .section { margin: 30px 0; }
          .section h2 { color: #5435ac; border-bottom: 2px solid #f7b322; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #5435ac; color: white; }
          .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Bellbill<span>Views</span></div>
          <h1>Ad Statistics Report${isAll ? " - All Ads" : ""}</h1>
          <p class="subtitle">Generated on ${format(new Date(), "PPP 'at' p")}</p>
        </div>
        
        ${!isAll && ad ? `
        <div class="section">
          <h2>Advertisement Details</h2>
          <table>
            <tr><td><strong>Title</strong></td><td>${ad.title}</td></tr>
            <tr><td><strong>Advertiser</strong></td><td>${ad.advertiser_name}</td></tr>
            <tr><td><strong>Type</strong></td><td>${ad.ad_type}</td></tr>
            <tr><td><strong>Placement</strong></td><td>${ad.placement}</td></tr>
            <tr><td><strong>Start Date</strong></td><td>${format(new Date(ad.start_date), "PPP")}</td></tr>
            <tr><td><strong>End Date</strong></td><td>${ad.end_date ? format(new Date(ad.end_date), "PPP") : "No end date"}</td></tr>
            <tr><td><strong>Status</strong></td><td>${ad.is_active ? "Active" : "Inactive"}</td></tr>
            ${ad.price ? `<tr><td><strong>Price</strong></td><td>${ad.currency} ${ad.price}</td></tr>` : ""}
          </table>
        </div>
        ` : ""}

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-value">${stats.views.toLocaleString()}</div>
            <div class="stat-label">Total Views</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.clicks.toLocaleString()}</div>
            <div class="stat-label">Total Clicks</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.ctr}%</div>
            <div class="stat-label">Click-Through Rate</div>
          </div>
        </div>

        <div class="section">
          <h2>Device Breakdown</h2>
          <table>
            <tr><th>Device</th><th>Count</th><th>Percentage</th></tr>
            ${Object.entries(devices).map(([device, count]) => `
              <tr><td>${device}</td><td>${count}</td><td>${((count / adAnalytics.length) * 100).toFixed(1)}%</td></tr>
            `).join("")}
          </table>
        </div>

        <div class="section">
          <h2>Browser Breakdown</h2>
          <table>
            <tr><th>Browser</th><th>Count</th><th>Percentage</th></tr>
            ${Object.entries(browsers).map(([browser, count]) => `
              <tr><td>${browser}</td><td>${count}</td><td>${((count / adAnalytics.length) * 100).toFixed(1)}%</td></tr>
            `).join("")}
          </table>
        </div>

        <div class="section">
          <h2>Country Breakdown</h2>
          <table>
            <tr><th>Country</th><th>Count</th><th>Percentage</th></tr>
            ${Object.entries(countries).map(([country, count]) => `
              <tr><td>${country}</td><td>${count}</td><td>${((count / adAnalytics.length) * 100).toFixed(1)}%</td></tr>
            `).join("")}
          </table>
        </div>

        <div class="footer">
          <p>Bellbill Views &copy; ${new Date().getFullYear()} - Confidential Ad Statistics Report</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  // Ad Form Component
  const AdForm = ({ ad, onSave }: { ad: BillboardAd | null; onSave: (data: Partial<BillboardAd>) => void }) => {
    const [formData, setFormData] = useState<Partial<BillboardAd>>(
      ad || {
        title: "",
        description: "",
        image_url: "",
        link_url: "",
        advertiser_name: "",
        advertiser_email: "",
        advertiser_phone: "",
        ad_type: "banner",
        placement: "all",
        start_date: new Date().toISOString(),
        end_date: null,
        is_active: true,
        is_auto_end: true,
        priority: 0,
        price: null,
        currency: "USD",
        notes: "",
      }
    );

    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Ad Title *</Label>
            <Input
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter ad title"
            />
          </div>

          <div className="col-span-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the ad"
              rows={2}
            />
          </div>

          <div className="col-span-2">
            <Label>Ad Image</Label>
            <FileUpload
              bucket="media"
              folder="ads"
              value={formData.image_url || ""}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
            />
          </div>

          <div className="col-span-2">
            <Label>Link URL</Label>
            <Input
              value={formData.link_url || ""}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              placeholder="https://example.com/landing-page"
            />
          </div>

          <div>
            <Label>Advertiser Name *</Label>
            <Input
              value={formData.advertiser_name || ""}
              onChange={(e) => setFormData({ ...formData, advertiser_name: e.target.value })}
              placeholder="Company/Person name"
            />
          </div>

          <div>
            <Label>Advertiser Email</Label>
            <Input
              type="email"
              value={formData.advertiser_email || ""}
              onChange={(e) => setFormData({ ...formData, advertiser_email: e.target.value })}
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <Label>Advertiser Phone</Label>
            <Input
              value={formData.advertiser_phone || ""}
              onChange={(e) => setFormData({ ...formData, advertiser_phone: e.target.value })}
              placeholder="+1234567890"
            />
          </div>

          <div>
            <Label>Ad Type</Label>
            <Select
              value={formData.ad_type}
              onValueChange={(value) => setFormData({ ...formData, ad_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Placement</Label>
            <Select
              value={formData.placement}
              onValueChange={(value) => setFormData({ ...formData, placement: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLACEMENTS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Priority (higher = more visible)</Label>
            <Input
              type="number"
              value={formData.priority || 0}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label>Start Date</Label>
            <Input
              type="datetime-local"
              value={formData.start_date?.slice(0, 16) || ""}
              onChange={(e) => setFormData({ ...formData, start_date: new Date(e.target.value).toISOString() })}
            />
          </div>

          <div>
            <Label>End Date (optional)</Label>
            <Input
              type="datetime-local"
              value={formData.end_date?.slice(0, 16) || ""}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
            />
          </div>

          <div>
            <Label>Price</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || null })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData({ ...formData, currency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal notes about this ad"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label>Active</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_auto_end}
              onCheckedChange={(checked) => setFormData({ ...formData, is_auto_end: checked })}
            />
            <Label>Auto-end on end date</Label>
          </div>
        </div>

        <Button
          onClick={() => onSave(formData)}
          className="w-full"
          disabled={!formData.title || !formData.advertiser_name}
        >
          {ad ? "Update Ad" : "Create Ad"}
        </Button>
      </div>
    );
  };

  // Network Form Component
  const NetworkForm = ({ network, onSave }: { network: AdNetwork | null; onSave: (data: Partial<AdNetwork>) => void }) => {
    const [formData, setFormData] = useState<Partial<AdNetwork>>(
      network || {
        name: "",
        network_type: "adsense",
        publisher_id: "",
        slot_ids: {},
        is_active: false,
        placement: "all",
        priority: 0,
        config: {},
      }
    );

    const [slotIdsJson, setSlotIdsJson] = useState(JSON.stringify(formData.slot_ids || {}, null, 2));
    const [configJson, setConfigJson] = useState(JSON.stringify(formData.config || {}, null, 2));

    return (
      <div className="space-y-4">
        <div>
          <Label>Network Name</Label>
          <Input
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My AdSense Account"
          />
        </div>

        <div>
          <Label>Network Type</Label>
          <Select
            value={formData.network_type}
            onValueChange={(value) => setFormData({ ...formData, network_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NETWORK_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Publisher/Client ID</Label>
          <Input
            value={formData.publisher_id || ""}
            onChange={(e) => setFormData({ ...formData, publisher_id: e.target.value })}
            placeholder="ca-pub-1234567890"
          />
        </div>

        <div>
          <Label>Slot IDs (JSON)</Label>
          <Textarea
            value={slotIdsJson}
            onChange={(e) => setSlotIdsJson(e.target.value)}
            placeholder='{"default": "1234567890", "sidebar": "0987654321"}'
            rows={3}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Format: {"{"}"placement": "slot_id"{"}"}
          </p>
        </div>

        <div>
          <Label>Placement</Label>
          <Select
            value={formData.placement}
            onValueChange={(value) => setFormData({ ...formData, placement: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLACEMENTS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.network_type === "custom" && (
          <div>
            <Label>Custom Embed Code / Config (JSON)</Label>
            <Textarea
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              placeholder='{"embed_code": "<script>...</script>"}'
              rows={4}
              className="font-mono text-sm"
            />
          </div>
        )}

        <div>
          <Label>Priority</Label>
          <Input
            type="number"
            value={formData.priority || 0}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>Active</Label>
        </div>

        <Button
          onClick={() => {
            try {
              const slot_ids = JSON.parse(slotIdsJson);
              const config = JSON.parse(configJson);
              onSave({ ...formData, slot_ids, config });
            } catch {
              toast.error("Invalid JSON in slot IDs or config");
            }
          }}
          className="w-full"
          disabled={!formData.name}
        >
          {network ? "Update Network" : "Add Network"}
        </Button>
      </div>
    );
  };

  return (
    <AdminLayout title="Billboard Ads" description="Manage paid advertisements and ad networks">
      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manual">Manual Ads</TabsTrigger>
          <TabsTrigger value="networks">Ad Networks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Manual Ads Tab */}
        <TabsContent value="manual" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Manual Advertisements</h2>
            <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingAd(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingAd ? "Edit Advertisement" : "Create New Advertisement"}</DialogTitle>
                </DialogHeader>
                <AdForm
                  ad={editingAd}
                  onSave={(data) => saveAdMutation.mutate(editingAd ? { ...data, id: editingAd.id } : data)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {adsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-muted h-48 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ads?.map((ad) => {
                const stats = selectedAdForStats === ad.id ? getAdStats(ad.id) : { views: 0, clicks: 0, ctr: "0" };
                return (
                  <Card key={ad.id} className={!ad.is_active ? "opacity-60" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{ad.title}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAdForStats(ad.id);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingAd(ad);
                              setIsAdDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Delete this ad?")) {
                                deleteAdMutation.mutate(ad.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {ad.image_url && (
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="w-full h-auto max-h-32 object-contain rounded mb-3"
                        />
                      )}
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground line-clamp-2">{ad.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-0.5 bg-primary/10 rounded">{ad.ad_type}</span>
                          <span className="px-2 py-0.5 bg-accent/10 rounded">{ad.placement}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          by {ad.advertiser_name}
                        </p>
                        {ad.price && (
                          <p className="text-xs font-medium">
                            {ad.currency} {ad.price}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Ad Networks Tab */}
        <TabsContent value="networks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Ad Network Integrations</h2>
            <Dialog open={isNetworkDialogOpen} onOpenChange={setIsNetworkDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingNetwork(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Network
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingNetwork ? "Edit Ad Network" : "Add Ad Network"}</DialogTitle>
                </DialogHeader>
                <NetworkForm
                  network={editingNetwork}
                  onSave={(data) => saveNetworkMutation.mutate(editingNetwork ? { ...data, id: editingNetwork.id } : data)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {networks?.map((network) => (
              <Card key={network.id} className={!network.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      {network.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingNetwork(network);
                          setIsNetworkDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Delete this network?")) {
                            deleteNetworkMutation.mutate(network.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="px-2 py-0.5 bg-primary/10 rounded capitalize">
                        {network.network_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Placement:</span>
                      <span>{network.placement}</span>
                    </div>
                    {network.publisher_id && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Publisher ID:</span>
                        <code className="text-xs bg-muted px-1 rounded">{network.publisher_id}</code>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={network.is_active ? "text-green-500" : "text-red-500"}>
                        {network.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Ad Analytics</h2>
            <Select
              value={selectedAdForStats || ""}
              onValueChange={(value) => setSelectedAdForStats(value)}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select an ad to view stats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📊 All Ads Combined</SelectItem>
                {ads?.map((ad) => (
                  <SelectItem key={ad.id} value={ad.id}>
                    {ad.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAdForStats && analytics ? (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Total Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">
                      {analytics.filter(a => a.event_type === "view").length.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <MousePointer className="w-4 h-4" />
                      Total Clicks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-accent">
                      {analytics.filter(a => a.event_type === "click").length.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">CTR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {getAdStats(selectedAdForStats).ctr}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          if (selectedAdForStats === "all") {
                            downloadStatsPDF(null);
                          } else {
                            const ad = ads?.find(a => a.id === selectedAdForStats);
                            if (ad) downloadStatsPDF(ad);
                          }
                        }}
                      >
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b">
                          <th className="text-left py-2">Event</th>
                          <th className="text-left py-2">Device</th>
                          <th className="text-left py-2">Browser</th>
                          <th className="text-left py-2">Country</th>
                          <th className="text-left py-2">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.slice(0, 50).map((event) => (
                          <tr key={event.id} className="border-b border-border/50">
                            <td className="py-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                event.event_type === "click" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                              }`}>
                                {event.event_type}
                              </span>
                            </td>
                            <td className="py-2 text-muted-foreground">{event.device_type || "-"}</td>
                            <td className="py-2 text-muted-foreground">{event.browser || "-"}</td>
                            <td className="py-2 text-muted-foreground">{event.country || "-"}</td>
                            <td className="py-2 text-muted-foreground">
                              {format(new Date(event.created_at), "MMM d, HH:mm")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="py-16">
              <CardContent className="text-center">
                <p className="text-muted-foreground">Select an ad to view its analytics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
