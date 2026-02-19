import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/admin/FileUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShows, useCreateShow, useUpdateShow, useDeleteShow, Show } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Mic } from "lucide-react";

export default function AdminShows() {
  const { data: shows, isLoading } = useShows();
  const createShow = useCreateShow();
  const updateShow = useUpdateShow();
  const deleteShow = useDeleteShow();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    host: "",
    description: "",
    schedule: "",
    time: "",
    image_url: "",
    is_active: true,
    sort_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      host: "",
      description: "",
      schedule: "",
      time: "",
      image_url: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingShow(null);
  };

  const handleEdit = (show: Show) => {
    setEditingShow(show);
    setFormData({
      name: show.name,
      host: show.host,
      description: show.description || "",
      schedule: show.schedule || "",
      time: show.time || "",
      image_url: show.image_url || "",
      is_active: show.is_active,
      sort_order: show.sort_order,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingShow) {
        await updateShow.mutateAsync({ id: editingShow.id, ...formData });
        toast({ title: "Show updated", description: `${formData.name} has been updated.` });
      } else {
        await createShow.mutateAsync(formData);
        toast({ title: "Show created", description: `${formData.name} has been added.` });
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save show." });
    }
  };

  const handleDelete = async (show: Show) => {
    if (!confirm(`Are you sure you want to delete "${show.name}"?`)) return;
    
    try {
      await deleteShow.mutateAsync(show.id);
      toast({ title: "Show deleted", description: `${show.name} has been removed.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete show." });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Shows">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Shows" description="Manage your radio programs">
      <div className="mb-6">
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Show
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingShow ? "Edit Show" : "Add New Show"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Show Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Morning Rise"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Host Name *</Label>
                <Input
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  placeholder="DJ Bello"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Start your day with the freshest Afrobeats..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Input
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    placeholder="Mon - Fri"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="6:00 AM - 10:00 AM"
                  />
                </div>
              </div>
              <FileUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Show Image"
                folder="shows"
              />
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createShow.isPending || updateShow.isPending}>
                {(createShow.isPending || updateShow.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingShow ? "Update Show" : "Add Show"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {shows && shows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shows.map((show) => (
            <Card key={show.id} className={!show.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {show.image_url ? (
                      <img src={show.image_url} alt={show.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Mic className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{show.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{show.host}</p>
                    </div>
                  </div>
                  {!show.is_active && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">Inactive</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{show.description}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  {show.schedule} • {show.time}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(show)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(show)}>
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
            <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No shows yet. Add your first show to get started!</p>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
