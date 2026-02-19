import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/admin/FileUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, Event } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function AdminEvents() {
  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    image_url: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      event_date: "",
      image_url: "",
      is_active: true,
    });
    setEditing(null);
  };

  const handleEdit = (event: Event) => {
    setEditing(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date ? event.event_date.slice(0, 16) : "",
      image_url: event.image_url || "",
      is_active: event.is_active,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        event_date: formData.event_date ? new Date(formData.event_date).toISOString() : null,
      };
      
      if (editing) {
        await updateEvent.mutateAsync({ id: editing.id, ...payload });
        toast({ title: "Event updated" });
      } else {
        await createEvent.mutateAsync(payload);
        toast({ title: "Event added" });
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleDelete = async (event: Event) => {
    if (!confirm(`Delete "${event.title}"?`)) return;
    
    try {
      await deleteEvent.mutateAsync(event.id);
      toast({ title: "Event deleted" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Events">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Events" description="Manage upcoming events and announcements">
      <div className="mb-6">
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Event" : "Add New Event"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Event Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Live Concert Special"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Join us for a special live event..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Event Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
              <FileUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Event Image"
                folder="events"
              />
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createEvent.isPending || updateEvent.isPending}>
                {(createEvent.isPending || updateEvent.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editing ? "Update" : "Add Event"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className={!event.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                {event.image_url && (
                  <img src={event.image_url} alt={event.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                )}
                <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
                {event.event_date && (
                  <p className="text-sm text-primary mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {format(new Date(event.event_date), "PPp")}
                  </p>
                )}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{event.description}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(event)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events yet. Add your first event!</p>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
