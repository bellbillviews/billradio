import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCurrentListeners, useListenerHistory } from "@/hooks/useListenerAnalytics";
import { Loader2, Users, Headphones, Clock, Download, Radio, Smartphone, Monitor, Globe } from "lucide-react";
import { format } from "date-fns";

export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const { data: current, isLoading: currentLoading } = useCurrentListeners();
  const { data: history, isLoading: historyLoading } = useListenerHistory(days);

  const totalSessions = history?.length || 0;
  const totalMinutes = Math.round((history?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0) / 60);
  const uniqueDevices = new Set(history?.map(s => s.session_id)).size;
  const mobileCount = history?.filter(s => s.device_type === "mobile").length || 0;
  const desktopCount = history?.filter(s => s.device_type === "desktop").length || 0;

  const handleDownloadPDF = () => {
    // Generate a simple text-based report as downloadable content
    const now = format(new Date(), "PPP pp");
    let content = `BELLBILL RADIO - LISTENER ANALYTICS REPORT\n`;
    content += `Generated: ${now}\n`;
    content += `Period: Last ${days} days\n`;
    content += `${"=".repeat(60)}\n\n`;
    content += `SUMMARY\n`;
    content += `-`.repeat(40) + `\n`;
    content += `Current Listeners: ${current?.count || 0}\n`;
    content += `Total Sessions: ${totalSessions}\n`;
    content += `Total Listening Time: ${totalMinutes} minutes\n`;
    content += `Unique Devices: ${uniqueDevices}\n`;
    content += `Mobile: ${mobileCount} | Desktop: ${desktopCount}\n\n`;
    content += `DETAILED SESSIONS\n`;
    content += `-`.repeat(40) + `\n`;
    content += `${"Started".padEnd(24)}${"Duration(s)".padEnd(14)}${"Device".padEnd(10)}${"Mode".padEnd(8)}\n`;
    content += `-`.repeat(56) + `\n`;
    history?.forEach(s => {
      content += `${format(new Date(s.started_at), "MMM dd HH:mm").padEnd(24)}${String(s.duration_seconds || 0).padEnd(14)}${(s.device_type || "?").padEnd(10)}${(s.listening_mode || "?").padEnd(8)}\n`;
    });

    // Create downloadable file
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bellbill-radio-analytics-${format(new Date(), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Listener Analytics" description="Monitor real-time and historical listener data">
      {/* Current listeners highlight */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-primary/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Radio className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{currentLoading ? "..." : current?.count || 0}</p>
              <p className="text-xs text-muted-foreground">Listening Now</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <Headphones className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{totalSessions}</p>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{totalMinutes}</p>
              <p className="text-xs text-muted-foreground">Total Minutes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{uniqueDevices}</p>
              <p className="text-xs text-muted-foreground">Unique Devices</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <Smartphone className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{mobileCount}</p>
              <p className="text-sm text-muted-foreground">Mobile Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <Monitor className="w-8 h-8 text-secondary" />
            <div>
              <p className="text-2xl font-bold">{desktopCount}</p>
              <p className="text-sm text-muted-foreground">Desktop Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-2" />Download Report
        </Button>
      </div>

      {/* Current Listeners Table */}
      {current && current.count > 0 && (
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Radio className="w-5 h-5 animate-pulse" />
              Currently Listening ({current.count})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Started</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Last Heartbeat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {current.sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{format(new Date(s.started_at), "HH:mm:ss")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {s.device_type === "mobile" ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                        {s.device_type || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{s.listening_mode}</TableCell>
                    <TableCell>{format(new Date(s.last_heartbeat), "HH:mm:ss")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>All listener sessions from the last {days} days</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {historyLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!history || history.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">No listener data yet.</TableCell>
                  </TableRow>
                ) : history.slice(0, 100).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{format(new Date(s.started_at), "MMM dd, HH:mm")}</TableCell>
                    <TableCell>{s.duration_seconds ? `${Math.round(s.duration_seconds / 60)}m` : "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {s.device_type === "mobile" ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                        {s.device_type || "?"}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{s.listening_mode || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
