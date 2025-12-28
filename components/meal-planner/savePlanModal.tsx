import { Save } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SavePlanModalProps {
  onSave: (name: string, notes?: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const SavePlanModal: React.FC<SavePlanModalProps> = ({ 
  onSave, 
  onClose, 
  isLoading = false 
}) => {
  const [planName, setPlanName] = useState("");
  const [notes, setNotes] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;
    onSave(planName, notes);
  };
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full mx-2 sm:mx-4">
        <DialogHeader>
          <div className="text-center mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2 sm:mb-3">
              <Save size={16} className="sm:hidden" />
              <Save size={24} className="hidden sm:block" />
            </div>
            <DialogTitle className="text-lg sm:text-xl">Save Your Meal Plan</DialogTitle>
            <DialogDescription className="text-sm">You can reuse this plan in the future</DialogDescription>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="planName" className="text-sm sm:text-base">Plan Name</Label>
            <Input
              id="planName"
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g., Weekly Meal Plan"
              required
              autoFocus
              className="mt-1 text-sm sm:text-base"
            />
          </div>
          
          <div>
            <Label htmlFor="planNotes" className="text-sm sm:text-base">Notes (Optional)</Label>
            <Textarea
              id="planNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes for this plan..."
              rows={4}
              className="mt-1 text-sm sm:text-base"
            />
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !planName.trim()}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Plan
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};