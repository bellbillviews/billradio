import { useState, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2, Copy, Image, FileImage, Folder } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface StorageFile {
  name: string;
  id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export default function AdminMedia() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState("uploads");

  const folders = ["uploads", "logos", "shows", "presenters", "events"];

  const { data: files, isLoading } = useQuery({
    queryKey: ["media-files", currentFolder],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("media")
        .list(currentFolder, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return data as StorageFile[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage
        .from("media")
        .remove([`${currentFolder}/${fileName}`]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      toast({ title: "File deleted" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to delete file" });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${currentFolder}/${fileName}`;

        const { error } = await supabase.storage.from("media").upload(filePath, file);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      toast({ title: "Files uploaded successfully" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ variant: "destructive", title: "Upload failed" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from("media")
      .getPublicUrl(`${currentFolder}/${fileName}`);
    return data.publicUrl;
  };

  const copyUrl = (fileName: string) => {
    const url = getPublicUrl(fileName);
    navigator.clipboard.writeText(url);
    toast({ title: "URL copied to clipboard" });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const isImage = (mimetype: string | null | undefined) => mimetype?.startsWith("image/");

  return (
    <AdminLayout title="Media Library" description="Upload and manage images and files">
      {/* Folder Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {folders.map((folder) => (
          <Button
            key={folder}
            variant={currentFolder === folder ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentFolder(folder)}
            className="capitalize"
          >
            <Folder className="w-4 h-4 mr-1" />
            {folder}
          </Button>
        ))}
      </div>

      {/* Upload Button */}
      <div className="mb-6">
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Upload Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* Files Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : files && files.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.filter(f => f.name !== ".emptyFolderPlaceholder").map((file) => (
            <Card key={file.id} className="overflow-hidden group">
              <CardContent className="p-0">
                <div className="aspect-square relative bg-muted">
                  {isImage(file.metadata?.mimetype as string) ? (
                    <img
                      src={getPublicUrl(file.name)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileImage className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => copyUrl(file.name)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(file.name)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize((file.metadata?.size as number) || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No files in this folder yet.</p>
            <p className="text-sm text-muted-foreground">Upload images to get started.</p>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
