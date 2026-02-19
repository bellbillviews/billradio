import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Download, Trash2, Check, MapPin, Calendar, Clock,
  MessageSquare, Bell, RefreshCw, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ListenerRequest {
  id: string;
  name: string;
  location: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminRequests() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<ListenerRequest | null>(null);

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ["listener_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listener_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ListenerRequest[];
    },
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("listener_requests")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listener_requests"] });
      toast.success("Marked as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("listener_requests")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listener_requests"] });
      toast.success("Request deleted");
    },
  });

  const unreadCount = requests.filter((r) => !r.is_read).length;

  const handleClickRequest = (request: ListenerRequest) => {
    setSelectedRequest(request);
    if (!request.is_read) {
      markAsReadMutation.mutate(request.id);
    }
  };

  const generatePDF = () => {
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Bellbill Radio - Listener Requests</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; }
    .header { text-align: center; border-bottom: 3px solid #5435ac; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #5435ac; margin: 0; font-size: 28px; }
    .header p { color: #f7b322; font-weight: bold; margin: 5px 0 0 0; }
    .header .date { color: #666; font-size: 12px; margin-top: 10px; }
    .request { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: #fafafa; }
    .request-header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; }
    .request-name { font-weight: bold; color: #5435ac; font-size: 16px; }
    .request-location { color: #666; font-size: 14px; }
    .request-date { color: #999; font-size: 12px; }
    .request-message { background: white; padding: 10px; border-radius: 4px; border-left: 3px solid #f7b322; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    .stats { display: flex; justify-content: center; gap: 30px; margin-bottom: 30px; }
    .stat { text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #5435ac; }
    .stat-label { font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Bellbill Radio</h1>
    <p>The Sound of Culture, Voice, and Music</p>
    <div class="date">Listener Requests Report - Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</div>
  </div>
  <div class="stats">
    <div class="stat"><div class="stat-value">${requests.length}</div><div class="stat-label">Total Requests</div></div>
    <div class="stat"><div class="stat-value">${unreadCount}</div><div class="stat-label">Unread</div></div>
    <div class="stat"><div class="stat-value">${requests.length - unreadCount}</div><div class="stat-label">Read</div></div>
  </div>
  ${requests.map((req) => `
    <div class="request">
      <div class="request-header">
        <div>
          <div class="request-name">${req.name}</div>
          <div class="request-location">📍 ${req.location}</div>
        </div>
        <div class="request-date">${format(new Date(req.created_at), "EEEE, MMMM d, yyyy")}<br/>${format(new Date(req.created_at), "h:mm a")}</div>
      </div>
      <div class="request-message">${req.message}</div>
    </div>
  `).join("")}
  <div class="footer">
    <p>Bellbill Radio &copy; ${new Date().getFullYear()} - All Rights Reserved</p>
  </div>
</body>
</html>`;

    const blob = new Blob([pdfContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    }
    toast.success("PDF report opened in new tab - use Print to save as PDF");
  };

  return (
    <AdminLayout title="Listener Requests" description="Song requests and messages from your listeners">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} new</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />Refresh
            </Button>
            <Button onClick={generatePDF} disabled={requests.length === 0}>
              <Download className="w-4 h-4 mr-2" />Download PDF
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{requests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />Unread
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{unreadCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {requests.filter((r) => format(new Date(r.created_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No listener requests yet. They will appear here when listeners submit requests from the Listen page.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="max-w-[300px]">Message</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow
                      key={request.id}
                      className={`cursor-pointer hover:bg-primary/5 transition-colors ${!request.is_read ? "bg-primary/5" : ""}`}
                      onClick={() => handleClickRequest(request)}
                    >
                      <TableCell>
                        {request.is_read ? (
                          <Badge variant="secondary">Read</Badge>
                        ) : (
                          <Badge variant="default" className="bg-primary">New</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />{request.location}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate">{request.message}</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(request.created_at), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(new Date(request.created_at), "h:mm a")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {!request.is_read && (
                            <Button size="sm" variant="ghost" onClick={() => markAsReadMutation.mutate(request.id)}>
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Request</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this request from {request.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(request.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Message Detail Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Message from {selectedRequest?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedRequest.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(selectedRequest.created_at), "PPp")}
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl border border-border whitespace-pre-wrap text-foreground leading-relaxed">
                  {selectedRequest.message}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
