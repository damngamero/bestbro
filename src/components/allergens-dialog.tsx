"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const COMMON_ALLERGENS = ["Peanuts", "Tree nuts", "Milk", "Egg", "Soy", "Wheat", "Fish", "Shellfish", "Gluten"];

interface AllergensDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  allergens: string[]
  onAllergensChange: (allergens: string[]) => void
}

export function AllergensDialog({
  isOpen,
  onOpenChange,
  allergens,
  onAllergensChange,
}: AllergensDialogProps) {
  const [newAllergen, setNewAllergen] = useState("")

  const handleToggleCommonAllergen = (allergen: string) => {
    onAllergensChange(
      allergens.includes(allergen)
        ? allergens.filter((a) => a !== allergen)
        : [...allergens, allergen]
    )
  }

  const handleAddCustomAllergen = () => {
    if (newAllergen.trim() && !allergens.includes(newAllergen.trim())) {
      onAllergensChange([...allergens, newAllergen.trim()])
      setNewAllergen("")
    }
  }

  const handleRemoveAllergen = (allergen: string) => {
    onAllergensChange(allergens.filter((a) => a !== allergen))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Allergens</DialogTitle>
          <DialogDescription>
            Select common allergens or add your own to filter out recipes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium">Common Allergens</Label>
            <div className="flex flex-wrap gap-2 pt-2">
              {COMMON_ALLERGENS.map((allergen) => (
                <Button
                  key={allergen}
                  variant={allergens.includes(allergen) ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleToggleCommonAllergen(allergen)}
                >
                  {allergen}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="custom-allergen" className="text-sm font-medium">
              Custom Allergen
            </Label>
            <div className="flex gap-2 pt-2">
              <Input
                id="custom-allergen"
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustomAllergen()}
                placeholder={"e.g., Sesame"}
              />
              <Button onClick={handleAddCustomAllergen}>Add</Button>
            </div>
          </div>
          {allergens.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Your Active Allergens</Label>
              <div className="flex flex-wrap gap-2 pt-2">
                {allergens.map((allergen) => (
                  <Badge
                    key={allergen}
                    variant="secondary"
                    className="py-1 px-3 text-sm"
                  >
                    {allergen}
                    <button
                      onClick={() => handleRemoveAllergen(allergen)}
                      className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      aria-label={`Remove ${allergen}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
