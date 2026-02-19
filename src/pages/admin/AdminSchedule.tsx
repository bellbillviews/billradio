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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useScheduledMedia, useCreateScheduledMedia, useUpdateScheduledMedia, useDeleteScheduledMedia, ScheduledMedia } from "@/hooks/useScheduledMedia";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, CalendarIcon, Clock, Play, Music, Video, FolderOpen } from "lucide-react";
import { format, isPast, isFuture, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export default function AdminSchedule() {
  const { data: items, isLoading } = useScheduledMedia();
  const createItem = useCreateScheduledMedia();
  const updateItem = useUpdateScheduledMedia();
  const deleteItem = useDeleteScheduledMedia();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduledMedia | null>(null);
  const [form, setForm] = useState({
    title: "",
    file_url: "",
    file_type: "audio" as string,
    scheduled_start: new Date(),
    scheduled_end: null as Date | null,
    is_active: true,
    repeat_mode: "none",
    notes: "",
  });

  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("12:00");
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState("13:00");

  const resetForm = () => {
    setForm({ title: "", file_url: "", file_type: "audio", scheduled_start: new Date(), scheduled_end: null, is_active: true, repeat_mode: "none", notes: "" });
    setStartDate(new Date());
    setStartTime("12:00");
    setEndDate(undefined);
    setEndTime("13:00");
    setEditing(null);
  };

  const handleEdit = (item: ScheduledMedia) => {
    setEditing(item);
    const start = new Date(item.scheduled_start);
    const end = item.scheduled_end ? new Date(item.scheduled_end) : undefined;
    setForm({
      title: item.title,
      file_url: item.file_url || "",
      file_type: item.file_type,
      scheduled_start: start,
      scheduled_end: end || null,
      is_active: item.is_active,
      repeat_mode: item.repeat_mode || "none",
      notes: item.notes || "",
    });
    setStartDate(start);
    setStartTime(format(start, "HH:mm"));
    setEndDate(end);
    setEndTime(end ? format(end, "HH:mm") : "13:00");
    setDialogOpen(true);
  };

  const combineDateAndTime = (date: Date | undefined, time: string): string => {
    if (!date) return new Date().toISOString();
    const [hours, minutes] = time.split(":").map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        file_url: form.file_url || null,
        file_type: form.file_type,
        scheduled_start: combineDateAndTime(startDate, startTime),
        scheduled_end: endDate ? combineDateAndTime(endDate, endTime) : null,
        is_active: form.is_active,
        repeat_mode: form.repeat_mode,
        notes: form.notes || null,
      };
      if (editing) {
        await updateItem.mutateAsync({ id: editing.id, ...payload });
        toast({ title: "Schedule updated" });
      } else {
        await createItem.mutateAsync(payload);
        toast({ title: "Media scheduled" });
      }
      setDialogOpen(false);
      resetForm();
    } catch {
      toast({ variant: "destructive", title: "Error saving schedule" });
    }
  };

  const handleDelete = async (item: ScheduledMedia) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try { await deleteItem.mutateAsync(item.id); toast({ title: "Deleted" }); }
    catch { toast({ variant: "destructive", title: "Error" }); }
  };

  const handleFilePick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `schedule/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast({ variant: "destructive", title: "Upload failed" }); return; }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    setForm(prev => ({ ...prev, file_url: publicUrl, title: prev.title || file.name, file_type: file.type.startsWith("video") ? "video" : "audio" }));
    toast({ title: "File uploaded" });
    e.target.value = "";
  };

  const getStatus = (item: ScheduledMedia) => {
    const start = new Date(item.scheduled_start);
    const end = item.scheduled_end ? new Date(item.scheduled_end) : null;
    const now = new Date();
    if (!item.is_active) return { label: "Disabled", variant: "secondary" as const };
    if (end && isPast(end)) return { label: "Ended", variant: "outline" as const };
    if (isFuture(start)) return { label: "Upcoming", variant: "default" as const };
    if (!end || isWithinInterval(now, { start, end })) return { label: "Now Playing", variant: "destructive" as const };
    return { label: "Unknown", variant: "secondary" as const };
  };

  if (isLoading) {
    return <AdminLayout title="Schedule"><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout title="Media Schedule" description="Schedule specific media to play at specific times on the /listen page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-muted-foreground">{items?.length || 0} scheduled items</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Schedule Media</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Schedule" : "Schedule New Media"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label>Media File</Label>
                <div className="flex gap-2">
                  <Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://... or upload" className="flex-1" />
                  <input ref={fileInputRef} type="file" accept="audio/*,video/*" className="hidden" onChange={handleFileSelected} />
                  <Button type="button" variant="outline" size="icon" onClick={handleFilePick}><FolderOpen className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.file_type} onValueChange={(v) => setForm({ ...form, file_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="audio"><div className="flex items-center gap-2"><Music className="w-4 h-4" />Audio</div></SelectItem>
                      <SelectItem value="video"><div className="flex items-center gap-2"><Video className="w-4 h-4" />Video</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Repeat</Label>
                  <Select value={form.repeat_mode} onValueChange={(v) => setForm({ ...form, repeat_mode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Repeat</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Start Date & Time */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" />Start Date & Time *</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="pl-10 w-36" />
                  </div>
                </div>
              </div>

              {/* End Date & Time */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" />End Date & Time (optional)</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="pl-10 w-36" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." rows={2} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
              </div>

              {/* Preview */}
              {form.file_url && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Play className="w-4 h-4" />Preview</Label>
                  {form.file_type === "video" ? (
                    <video src={form.file_url} controls className="w-full rounded-lg max-h-40" />
                  ) : (
                    <audio src={form.file_url} controls className="w-full" />
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={createItem.isPending || updateItem.isPending}>
                {(createItem.isPending || updateItem.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editing ? "Update Schedule" : "Schedule Media"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Repeat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    No scheduled media yet. Click "Schedule Media" to add one.
                  </TableCell>
                </TableRow>
              ) : items.map((item) => {
                const status = getStatus(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {item.file_type === "video" ? <Video className="w-3 h-3" /> : <Music className="w-3 h-3" />}
                        {item.file_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{format(new Date(item.scheduled_start), "MMM dd, yyyy HH:mm")}</TableCell>
                    <TableCell className="text-sm">{item.scheduled_end ? format(new Date(item.scheduled_end), "MMM dd, yyyy HH:mm") : "—"}</TableCell>
                    <TableCell className="capitalize">{item.repeat_mode}</TableCell>
                    <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
