import { useState, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useAdminData";
import { useBroadcastPlatforms, useCreateBroadcastPlatform, useUpdateBroadcastPlatform, useDeleteBroadcastPlatform, BroadcastPlatform } from "@/hooks/useAdminData";
import { useBroadcastQueue, useCreateQueueItem, useUpdateQueueItem, useDeleteQueueItem, useReorderQueue, BroadcastQueueItem } from "@/hooks/useBroadcastQueue";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Tv, Radio, Youtube, ArrowUp, ArrowDown, Music, Upload, Eye, Save, FolderOpen, Play, RotateCcw, GripVertical, ListPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function extractVideoId(input: string): string {
  if (!input) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) { const m = input.match(p); if (m) return m[1]; }
  return input.trim();
}

const platformTypes = ["radioco", "youtube", "twitch", "facebook", "custom"];

export default function AdminBroadcast() {
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const { data: platforms, isLoading: platformsLoading } = useBroadcastPlatforms();
  const createPlatform = useCreateBroadcastPlatform();
  const updatePlatform = useUpdateBroadcastPlatform();
  const deletePlatform = useDeleteBroadcastPlatform();
  const { data: queue } = useBroadcastQueue("broadcast");
  const createQueueItem = useCreateQueueItem();
  const deleteQueueItem = useDeleteQueueItem();
  const reorderQueue = useReorderQueue();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"audio" | "video">("audio");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<BroadcastPlatform | null>(null);
  const [platformForm, setPlatformForm] = useState({ name: "", platform_type: "radioco", embed_code: "", stream_url: "", is_active: true, is_primary: false });

  const [queueDialogOpen, setQueueDialogOpen] = useState(false);
  const [queueForm, setQueueForm] = useState({ title: "", file_url: "", file_type: "audio" as string });

  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  const getSetting = (key: string) => settings?.find(s => s.setting_key === key);
  const getVal = (key: string) => localSettings[key] ?? getSetting(key)?.setting_value ?? "";
  const setLocalVal = (key: string, value: string) => setLocalSettings(prev => ({ ...prev, [key]: value }));

  const handleSaveAll = async () => {
    try {
      const promises = [];
      for (const [key, value] of Object.entries(localSettings)) {
        const setting = getSetting(key)
        if (setting) {
          promises.push(updateSetting.mutateAsync({ id: setting.id, setting_value: value }));
        }
      }
      await Promise.all(promises);
      toast({ title: "All settings saved!" });
    } catch {
      toast({ variant: "destructive", title: "Failed to save settings" });
    }
  };

  const videoId = extractVideoId(getVal("youtube_live_video_id"));
  const broadcastEnabled = getVal("broadcast_enabled") === "true";
  const autoplay = getVal("broadcast_autoplay") === "true";
  const mixlrEnabled = getVal("mixlr_enabled") === "true";
  const queueRepeatAll = getVal("queue_repeat_all") !== "false";

  const handleToggle = async (key: string, checked: boolean) => {
    const setting = getSetting(key);
    if (setting) {
      await updateSetting.mutateAsync({ id: setting.id, setting_value: checked ? "true" : "false" });
    }
  };

  const resetPlatformForm = () => {
    setPlatformForm({ name: "", platform_type: "radioco", embed_code: "", stream_url: "", is_active: true, is_primary: false });
    setEditingPlatform(null);
  };
  const handleEditPlatform = (p: BroadcastPlatform) => {
    setEditingPlatform(p);
    setPlatformForm({ name: p.name, platform_type: p.platform_type, embed_code: p.embed_code || "", stream_url: p.stream_url || "", is_active: p.is_active, is_primary: p.is_primary });
    setPlatformDialogOpen(true);
  };
  const handlePlatformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlatform) await updatePlatform.mutateAsync({ id: editingPlatform.id, ...platformForm });
      else await createPlatform.mutateAsync(platformForm);
      toast({ title: editingPlatform ? "Platform updated" : "Platform added" });
      setPlatformDialogOpen(false);
      resetPlatformForm();
    } catch { toast({ variant: "destructive", title: "Error" }); }
  };
  const handleDeletePlatform = async (p: BroadcastPlatform) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await deletePlatform.mutateAsync(p.id); toast({ title: "Deleted" }); } catch { toast({ variant: "destructive", title: "Error" }); }
  };

  const handleAddQueueItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQueueItem.mutateAsync({
        title: queueForm.title,
        file_url: queueForm.file_url || null,
        file_type: queueForm.file_type,
        queue_type: "broadcast",
        duration_seconds: null,
        sort_order: (queue?.length || 0),
        is_active: true,
      });
      toast({ title: "Item added to queue" });
      setQueueDialogOpen(false);
      setQueueForm({ title: "", file_url: "", file_type: "audio" });
    } catch { toast({ variant: "destructive", title: "Error" }); }
  };

  const handleLocalFilePick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.type.startsWith("video") ? "video" : "audio";
      // Upload to storage
      const ext = file.name.split(".").pop();
      const path = `queue/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("files").upload(path, file);
      if (uploadErr) { toast({ variant: "destructive", title: "Upload failed", description: uploadErr.message }); continue; }
      const { data: { publicUrl } } = supabase.storage.from("files").getPublicUrl(path);
      await createQueueItem.mutateAsync({
        title: file.name,
        file_url: publicUrl,
        file_type: fileType,
        queue_type: "broadcast",
        duration_seconds: null,
        sort_order: (queue?.length || 0) + i,
        is_active: true,
      });
    }
    toast({ title: `${files.length} file(s) uploaded and added to queue` });
    e.target.value = "";
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex || !queue) return;

    const newQueue = [...queue];
    const [draggedItem] = newQueue.splice(draggedIndex, 1);
    newQueue.splice(dropIndex, 0, draggedItem);
    setDraggedIndex(null);
    reorderQueue.mutateAsync(newQueue.map((item, i) => ({ id: item.id, sort_order: i })));
  };

  if (settingsLoading) {
    return (
      <AdminLayout title="Broadcast Management">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>
    );
  }

  const hasUnsavedChanges = Object.keys(localSettings).length > 0;

  return (
    <AdminLayout title="Broadcast Management" description="Audio (Radio.co), Video (YouTube Live), Queue & Platforms">
      {hasUnsavedChanges && (
        <div className="sticky top-0 z-10 mb-4 p-3 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-between">
          <p className="text-sm text-primary font-medium">You have unsaved changes</p>
          <Button onClick={handleSaveAll} disabled={updateSetting.isPending} className="bg-primary hover:bg-primary/90">
            {updateSetting.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save All Changes
          </Button>
        </div>
      )}

      <Tabs defaultValue="audio" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="audio"><Radio className="w-4 h-4 mr-1.5" />Mixlr</TabsTrigger>
          <TabsTrigger value="youtube"><Youtube className="w-4 h-4 mr-1.5" />YouTube</TabsTrigger>
          <TabsTrigger value="queue"><Music className="w-4 h-4 mr-1.5" />Queue</TabsTrigger>
          <TabsTrigger value="platforms"><Tv className="w-4 h-4 mr-1.5" />Platforms</TabsTrigger>
        </TabsList>

        {/* Audio Tab — Radio.co */}
        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Radio className="w-5 h-5 text-primary" />Mixlr Audio Stream</CardTitle>
              <CardDescription>Configure your Mixlr stream for the Audio tab on /listen. This overrides the queue when enabled.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                <div>
                  <Label className="text-base font-semibold">Enable Mixlr Live</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Toggle ON to enable audio streaming via Mixlr</p>
                </div>
                <Switch checked={mixlrEnabled} onCheckedChange={(c) => handleToggle("mixlr_enabled", c)} />
              </div>

              <div className="space-y-2">
                <Label>Mixlr Event URL</Label>
                <Input
                  value={getVal("mixlr_event_url")}
                  onChange={(e) => setLocalVal("mixlr_event_url", e.target.value)}
                  placeholder="https://mixlr.com/bellbillviews/events/..."
                />
                <p className="text-xs text-muted-foreground">The direct link to your current Mixlr event (for preview)</p>
              </div>

              <div className="space-y-2">
                <Label>Mixlr Embed Code</Label>
                <Textarea
                  value={getVal("mixlr_embed_code")}
                  onChange={(e) => setLocalVal("mixlr_embed_code", e.target.value)}
                  placeholder='<iframe src="https://bellbillviews.mixlr.com/embed" ...></iframe>'
                  rows={4}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">Default: &lt;iframe src="https://bellbillviews.mixlr.com/embed" frameborder="0" scrolling="no" height="200px" width="100%"&gt;&lt;/iframe&gt;...</p>
              </div>

              <Button onClick={handleSaveAll} disabled={!hasUnsavedChanges || updateSetting.isPending} className="w-full">
                {updateSetting.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Mixlr Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* YouTube Live Tab */}
        <TabsContent value="youtube" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Youtube className="w-5 h-5 text-red-500" />YouTube Live Video</CardTitle>
              <CardDescription>Configure YouTube Live for the Video tab on /listen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                <div>
                  <Label className="text-base font-semibold">Live Broadcast</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Toggle ON when your YouTube stream is live</p>
                </div>
                <Switch checked={broadcastEnabled} onCheckedChange={(c) => handleToggle("broadcast_enabled", c)} />
              </div>

              <div className="space-y-2">
                <Label>YouTube Live Video ID or URL</Label>
                <Input
                  value={getVal("youtube_live_video_id")}
                  onChange={(e) => setLocalVal("youtube_live_video_id", e.target.value)}
                  placeholder="dQw4w9WgXcQ or https://youtube.com/live/..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Autoplay</Label>
                  <p className="text-xs text-muted-foreground">Auto-start video playback</p>
                </div>
                <Switch checked={autoplay} onCheckedChange={(c) => handleToggle("broadcast_autoplay", c)} />
              </div>

              <div className="space-y-2">
                <Label>Offline Message</Label>
                <Textarea
                  value={getVal("broadcast_offline_message")}
                  onChange={(e) => setLocalVal("broadcast_offline_message", e.target.value)}
                  placeholder="We are currently offline..."
                  rows={2}
                />
              </div>

              <Button onClick={handleSaveAll} disabled={!hasUnsavedChanges || updateSetting.isPending} className="w-full">
                {updateSetting.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Video Settings
              </Button>

              {videoId && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Eye className="w-4 h-4" />Live Preview</Label>
                  <div className="rounded-xl overflow-hidden border border-border">
                    <AspectRatio ratio={16 / 9}>
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                        className="w-full h-full"
                        title="Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        frameBorder="0"
                      />
                    </AspectRatio>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queue Tab */}
        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-1">
                  <CardTitle>Queue & Playlists</CardTitle>
                  <CardDescription>Autoplays when live streams are offline. Drag to reorder.</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Select defaultValue="default">
                      <SelectTrigger className="h-8 w-[180px]"><SelectValue placeholder="Select Playlist" /></SelectTrigger>
                      <SelectContent><SelectItem value="default">Default Queue</SelectItem></SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="h-8"><ListPlus className="w-3.5 h-3.5 mr-1.5" />New</Button>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex items-center gap-2 mr-2">
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm">Loop</Label>
                    <Switch checked={queueRepeatAll} onCheckedChange={(c) => handleToggle("queue_repeat_all", c)} />
                  </div>
                  <input ref={fileInputRef} type="file" accept="audio/*,video/*,.m4a,.flac,.wav,.mp3,.mp4" multiple className="hidden" onChange={handleFileSelected} />
                  <Button variant="outline" size="sm" onClick={handleLocalFilePick}><FolderOpen className="w-4 h-4 mr-1" />Upload Files</Button>
                  <Dialog open={queueDialogOpen} onOpenChange={setQueueDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add URL</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add to Queue</DialogTitle></DialogHeader>
                      <form onSubmit={handleAddQueueItem} className="space-y-4">
                        <div className="space-y-2">
                        <Label>Title (will overwrite existing file title)</Label>
                          <Input value={queueForm.title} onChange={(e) => setQueueForm({ ...queueForm, title: e.target.value })} placeholder="Track name" required />
                        </div>
                        <div className="space-y-2">
                          <Label>File URL</Label>
                          <Input value={queueForm.file_url} onChange={(e) => setQueueForm({ ...queueForm, file_url: e.target.value })} placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={queueForm.file_type} onValueChange={(v) => setQueueForm({ ...queueForm, file_type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="audio">Audio</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full" disabled={createQueueItem.isPending}>
                          {createQueueItem.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Add to Queue
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {queue && queue.length > 0 ? (
                <div className="space-y-2">
                  {queue.map((item, index) => (
                    <div 
                      key={item.id} 
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => { e.preventDefault(); handleDrop(index); }}
                      className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border transition-colors ${draggedIndex === index ? 'opacity-50 border-primary border-dashed' : 'hover:border-primary/50'}`}
                    >
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono w-6 text-center">{index + 1}</span>
                      <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Music className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.file_type}</p>
                      </div>
                      <div className="flex gap-1">
                        {/* Preview button */}
                        {item.file_url && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setPreviewUrl(item.file_url); setPreviewType(item.file_type as "audio" | "video"); }}>
                            <Play className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Remove?")) deleteQueueItem.mutate(item.id); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Music className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm mb-4">No items in queue. These will autoplay as fallback when live streams are offline.</p>
                  <Button variant="outline" onClick={handleLocalFilePick}>
                    <FolderOpen className="w-4 h-4 mr-2" />Upload Files From Computer
                  </Button>
                </div>
              )}

              {/* Preview player */}
              {previewUrl && (
                <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">Preview</Label>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewUrl(null)}>Close</Button>
                  </div>
                  {previewType === "video" ? (
                    <video src={previewUrl} controls className="w-full rounded-lg max-h-48" />
                  ) : (
                    <audio src={previewUrl} controls className="w-full" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="mb-4">
            <Dialog open={platformDialogOpen} onOpenChange={(open) => { setPlatformDialogOpen(open); if (!open) resetPlatformForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Add Platform</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingPlatform ? "Edit Platform" : "Add Broadcast Platform"}</DialogTitle></DialogHeader>
                <form onSubmit={handlePlatformSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Platform Name *</Label>
                    <Input value={platformForm.name} onChange={(e) => setPlatformForm({ ...platformForm, name: e.target.value })} placeholder="Radio.co Live" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Platform Type</Label>
                    <Select value={platformForm.platform_type} onValueChange={(v) => setPlatformForm({ ...platformForm, platform_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{platformTypes.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Stream URL</Label>
                    <Input value={platformForm.stream_url} onChange={(e) => setPlatformForm({ ...platformForm, stream_url: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Embed Code</Label>
                    <Textarea value={platformForm.embed_code} onChange={(e) => setPlatformForm({ ...platformForm, embed_code: e.target.value })} placeholder='<iframe ...></iframe>' rows={4} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch checked={platformForm.is_active} onCheckedChange={(c) => setPlatformForm({ ...platformForm, is_active: c })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Primary</Label>
                    <Switch checked={platformForm.is_primary} onCheckedChange={(c) => setPlatformForm({ ...platformForm, is_primary: c })} />
                  </div>
                  <Button type="submit" className="w-full" disabled={createPlatform.isPending || updatePlatform.isPending}>
                    {(createPlatform.isPending || updatePlatform.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingPlatform ? "Update" : "Add Platform"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {platformsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : platforms && platforms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map((p) => (
                <Card key={p.id} className={!p.is_active ? "opacity-60" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Tv className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{p.name}</CardTitle>
                          <CardDescription className="capitalize">{p.platform_type}</CardDescription>
                        </div>
                      </div>
                      {p.is_primary && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Primary</span>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {p.stream_url && <p className="text-sm text-muted-foreground mb-2 truncate">{p.stream_url}</p>}
                    {p.embed_code && <p className="text-xs text-muted-foreground mb-3">Embed configured ✓</p>}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditPlatform(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePlatform(p)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No platforms configured.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
