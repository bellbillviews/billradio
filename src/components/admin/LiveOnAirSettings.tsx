import { useState, useEffect } from "react";
import { Radio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePresenters, useShows, useSiteSettings } from "@/hooks/useAdminData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function LiveOnAirSettings() {
  const { data: presenters } = usePresenters();
  const { data: shows } = useShows();
  const { data: settings } = useSiteSettings();
  const [presenterId, setPresenterId] = useState("");
  const [showId, setShowId] = useState("");
  const [saving, setSaving] = useState(false);

  const activePresenters = presenters?.filter(p => p.is_active) || [];
  const activeShows = shows?.filter(s => s.is_active) || [];

  useEffect(() => {
    if (settings) {
      const lp = settings.find(s => s.setting_key === "live_presenter_id");
      const ls = settings.find(s => s.setting_key === "live_show_id");
      if (lp?.setting_value) setPresenterId(lp.setting_value);
      if (ls?.setting_value) setShowId(ls.setting_value);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase
        .from("site_settings")
        .update({ setting_value: presenterId })
        .eq("setting_key", "live_presenter_id");
      await supabase
        .from("site_settings")
        .update({ setting_value: showId })
        .eq("setting_key", "live_show_id");
      toast.success("Live on air updated!");
    } catch (err) {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await supabase.from("site_settings").update({ setting_value: "" }).eq("setting_key", "live_presenter_id");
      await supabase.from("site_settings").update({ setting_value: "" }).eq("setting_key", "live_show_id");
      setPresenterId("");
      setShowId("");
      toast.success("Cleared live on air");
    } catch {
      toast.error("Failed to clear");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <Radio className="w-5 h-5 text-primary" />
          Live On Air
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Current Presenter</Label>
          <Select value={presenterId} onValueChange={setPresenterId}>
            <SelectTrigger>
              <SelectValue placeholder="Select presenter on air" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No presenter</SelectItem>
              {activePresenters.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Current Show</Label>
          <Select value={showId} onValueChange={setShowId}>
            <SelectTrigger>
              <SelectValue placeholder="Select show on air" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No show</SelectItem>
              {activeShows.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Set Live
          </Button>
          <Button variant="outline" onClick={handleClear} disabled={saving}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
