import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStreamSettings, useCreateStreamSetting, useUpdateStreamSetting, useDeleteStreamSetting, StreamSetting } from "@/hooks/useAdminData";
import { useBroadcastQueue, useCreateQueueItem, useDeleteQueueItem, useReorderQueue } from "@/hooks/useBroadcastQueue";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Video, Copy, Eye, EyeOff, Music, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminStream() {
  const { data: settings, isLoading } = useStreamSettings();
  const createSetting = useCreateStreamSetting();
  const updateSetting = useUpdateStreamSetting();
  const deleteSetting = useDeleteStreamSetting();
  const { data: queue } = useBroadcastQueue("stream");
  const createQueueItem = useCreateQueueItem();
  const deleteQueueItem = useDeleteQueueItem();
  const reorderQueue = useReorderQueue();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<StreamSetting | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: "", stream_type: "video", stream_url: "", stream_key: "", rtmp_url: "", is_active: true,
  });

  const [queueDialogOpen, setQueueDialogOpen] = useState(false);
  const [queueForm, setQueueForm] = useState({ title: "", file_url: "", file_type: "video" as string });

  const resetForm = () => {
    setFormData({ name: "", stream_type: "video", stream_url: "", stream_key: "", rtmp_url: "", is_active: true });
    setEditing(null);
  };

  const handleEdit = (s: StreamSetting) => {
    setEditing(s);
    setFormData({ name: s.name, stream_type: s.stream_type, stream_url: s.stream_url || "", stream_key: s.stream_key || "", rtmp_url: s.rtmp_url || "", is_active: s.is_active });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await updateSetting.mutateAsync({ id: editing.id, ...formData }); toast({ title: "Updated" }); }
      else { await createSetting.mutateAsync(formData); toast({ title: "Added" }); }
      setIsOpen(false); resetForm();
    } catch { toast({ variant: "destructive", title: "Error" }); }
  };

  const handleDelete = async (s: StreamSetting) => {
    if (!confirm(`Delete "${s.name}"?`)) return;
    try { await deleteSetting.mutateAsync(s.id); toast({ title: "Deleted" }); }
    catch { toast({ variant: "destructive", title: "Error" }); }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  const handleAddQueueItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQueueItem.mutateAsync({
        title: queueForm.title, file_url: queueForm.file_url || null, file_type: queueForm.file_type,
        queue_type: "stream", duration_seconds: null, sort_order: (queue?.length || 0), is_active: true,
      });
      toast({ title: "Added to queue" });
      setQueueDialogOpen(false);
      setQueueForm({ title: "", file_url: "", file_type: "video" });
    } catch { toast({ variant: "destructive", title: "Error" }); }
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    if (!queue) return;
    const newQ = [...queue];
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= newQ.length) return;
    [newQ[index], newQ[swap]] = [newQ[swap], newQ[index]];
    await reorderQueue.mutateAsync(newQ.map((item, i) => ({ id: item.id, sort_order: i })));
  };

  if (isLoading) {
    return <AdminLayout title="Video Stream Settings"><div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout title="Video Stream Settings" description="Configure video-based streaming via vMix, OBS, playlists & queue">
      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="config"><Video className="w-4 h-4 mr-1.5" />Stream Config</TabsTrigger>
          <TabsTrigger value="queue"><Music className="w-4 h-4 mr-1.5" />Video Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-medium text-foreground mb-2">How to use with vMix/OBS</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Add a stream config below with your RTMP URL and Stream Key</li>
                <li>Copy the RTMP URL into vMix/OBS as the "Server"</li>
                <li>Copy the Stream Key into the "Stream Key" field</li>
                <li>Start streaming!</li>
              </ol>
            </CardContent>
          </Card>

          <div className="mb-6">
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Stream Config</Button></DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Stream Configuration</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="vMix Main" /></div>
                  <div className="space-y-2">
                    <Label>Stream Type</Label>
                    <Select value={formData.stream_type} onValueChange={(v) => setFormData({ ...formData, stream_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="audio">Audio Only</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>RTMP URL</Label><Input value={formData.rtmp_url} onChange={(e) => setFormData({ ...formData, rtmp_url: e.target.value })} placeholder="rtmp://..." /></div>
                  <div className="space-y-2"><Label>Stream Key</Label><Input value={formData.stream_key} onChange={(e) => setFormData({ ...formData, stream_key: e.target.value })} type="password" placeholder="secret-key" /></div>
                  <div className="space-y-2"><Label>Playback URL</Label><Input value={formData.stream_url} onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })} placeholder="https://stream.../live.m3u8" /></div>
                  <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} /></div>
                  <Button type="submit" className="w-full" disabled={createSetting.isPending || updateSetting.isPending}>
                    {(createSetting.isPending || updateSetting.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editing ? "Update" : "Add"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {settings && settings.length > 0 ? (
            <div className="space-y-4">
              {settings.map((s) => (
                <Card key={s.id} className={!s.is_active ? "opacity-60" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><Video className="w-5 h-5 text-primary" /></div>
                        <div><CardTitle className="text-lg">{s.name}</CardTitle><CardDescription className="capitalize">{s.stream_type}</CardDescription></div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(s)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(s)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {s.rtmp_url && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <div className="flex-1"><p className="text-xs text-muted-foreground">RTMP URL</p><p className="text-sm font-mono truncate">{s.rtmp_url}</p></div>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(s.rtmp_url!, "RTMP URL")}><Copy className="w-4 h-4" /></Button>
                      </div>
                    )}
                    {s.stream_key && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <div className="flex-1"><p className="text-xs text-muted-foreground">Stream Key</p><p className="text-sm font-mono">{showKeys[s.id] ? s.stream_key : "••••••••••"}</p></div>
                        <Button variant="ghost" size="sm" onClick={() => setShowKeys(p => ({ ...p, [s.id]: !p[s.id] }))}>{showKeys[s.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(s.stream_key!, "Key")}><Copy className="w-4 h-4" /></Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-12 text-center"><Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No stream configs yet.</p></CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Video Queue</CardTitle><CardDescription>Add recorded videos or local files. Reorder playback sequence.</CardDescription></div>
                <Dialog open={queueDialogOpen} onOpenChange={setQueueDialogOpen}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Add</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add to Video Queue</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddQueueItem} className="space-y-4">
                      <div className="space-y-2"><Label>Title *</Label><Input value={queueForm.title} onChange={(e) => setQueueForm({ ...queueForm, title: e.target.value })} required /></div>
                      <div className="space-y-2"><Label>File URL</Label><Input value={queueForm.file_url} onChange={(e) => setQueueForm({ ...queueForm, file_url: e.target.value })} /></div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={queueForm.file_type} onValueChange={(v) => setQueueForm({ ...queueForm, file_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="audio">Audio</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full" disabled={createQueueItem.isPending}>{createQueueItem.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Add</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {queue && queue.length > 0 ? (
                <div className="space-y-2">
                  {queue.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                      <span className="text-xs text-muted-foreground font-mono w-6 text-center">{idx + 1}</span>
                      <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center"><Video className="w-4 h-4 text-primary" /></div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.title}</p><p className="text-xs text-muted-foreground capitalize">{item.file_type}</p></div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(idx, "up")} disabled={idx === 0}><ArrowUp className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(idx, "down")} disabled={idx === queue.length - 1}><ArrowDown className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Remove?")) deleteQueueItem.mutate(item.id); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8"><Video className="w-10 h-10 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground text-sm">No items. Add videos above.</p></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
