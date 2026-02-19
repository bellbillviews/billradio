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
import { usePresenters, useCreatePresenter, useUpdatePresenter, useDeletePresenter, Presenter } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, User } from "lucide-react";

export default function AdminPresenters() {
  const { data: presenters, isLoading } = usePresenters();
  const createPresenter = useCreatePresenter();
  const updatePresenter = useUpdatePresenter();
  const deletePresenter = useDeletePresenter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingPresenter, setEditingPresenter] = useState<Presenter | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    email: "",
    image_url: "",
    is_active: true,
    sort_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      bio: "",
      email: "",
      image_url: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingPresenter(null);
  };

  const handleEdit = (presenter: Presenter) => {
    setEditingPresenter(presenter);
    setFormData({
      name: presenter.name,
      bio: presenter.bio || "",
      email: presenter.email || "",
      image_url: presenter.image_url || "",
      is_active: presenter.is_active,
      sort_order: presenter.sort_order,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPresenter) {
        await updatePresenter.mutateAsync({ id: editingPresenter.id, ...formData });
        toast({ title: "Presenter updated" });
      } else {
        await createPresenter.mutateAsync(formData);
        toast({ title: "Presenter added" });
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save presenter." });
    }
  };

  const handleDelete = async (presenter: Presenter) => {
    if (!confirm(`Delete "${presenter.name}"?`)) return;
    
    try {
      await deletePresenter.mutateAsync(presenter.id);
      toast({ title: "Presenter deleted" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Presenters">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Presenters" description="Manage your radio hosts and presenters">
      <div className="mb-6">
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Presenter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPresenter ? "Edit Presenter" : "Add New Presenter"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="DJ Bello"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief bio about the presenter..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="presenter@bellbillviews.com"
                />
              </div>
              <FileUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Profile Image"
                folder="presenters"
              />
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createPresenter.isPending || updatePresenter.isPending}>
                {(createPresenter.isPending || updatePresenter.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingPresenter ? "Update" : "Add Presenter"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {presenters && presenters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presenters.map((presenter) => (
            <Card key={presenter.id} className={!presenter.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {presenter.image_url ? (
                    <img src={presenter.image_url} alt={presenter.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{presenter.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{presenter.bio}</p>
                    {presenter.email && (
                      <p className="text-xs text-muted-foreground mt-1">{presenter.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(presenter)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(presenter)}>
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
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No presenters yet. Add your first presenter!</p>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
