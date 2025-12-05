import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { FAQ, FAQFormData } from "../types";
import { getEmptyFAQForm, mapFAQToFormData } from "../types";

interface FAQFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFAQ: FAQ | null;
  onSubmit: (data: FAQFormData, isEditing: boolean) => void;
  isPending: boolean;
  defaultOrder: number;
}

export function FAQForm({
  open,
  onOpenChange,
  editingFAQ,
  onSubmit,
  isPending,
  defaultOrder,
}: FAQFormProps) {
  const [formData, setFormData] = useState<FAQFormData>(getEmptyFAQForm(defaultOrder));

  useEffect(() => {
    if (open) {
      if (editingFAQ) {
        setFormData(mapFAQToFormData(editingFAQ));
      } else {
        setFormData(getEmptyFAQForm(defaultOrder));
      }
    }
  }, [open, editingFAQ, defaultOrder]);

  const handleSubmit = () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      return;
    }
    onSubmit(formData, !!editingFAQ);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingFAQ ? "Edit FAQ" : "Create New FAQ"}</DialogTitle>
          <DialogDescription>
            {editingFAQ ? "Update the FAQ entry" : "Add a new frequently asked question"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Input
              id="question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter the question"
              data-testid="input-question"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Enter the answer"
              rows={4}
              data-testid="input-answer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
                data-testid="input-order"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={formData.visible}
                onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                data-testid="switch-visible"
              />
              <Label>Visible on website</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} data-testid="button-save-faq">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : editingFAQ ? (
              "Update FAQ"
            ) : (
              "Create FAQ"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
