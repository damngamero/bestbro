"use client"

import { useState, useMemo, useEffect } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Search } from "lucide-react"
import { INGREDIENT_LIST } from "@/lib/ingredients"

interface IngredientsDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  selectedIngredients: string[]
  onIngredientsChange: (ingredients: string[]) => void
}

export function IngredientsDialog({
  isOpen,
  onOpenChange,
  selectedIngredients,
  onIngredientsChange,
}: IngredientsDialogProps) {
  const [internalSelection, setInternalSelection] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    if(isOpen) {
      setInternalSelection(selectedIngredients);
      setSearchTerm("");
    }
  }, [isOpen, selectedIngredients]);

  const handleToggleIngredient = (ingredient: string) => {
    setInternalSelection(
      internalSelection.includes(ingredient)
        ? internalSelection.filter((i) => i !== ingredient)
        : [...internalSelection, ingredient]
    )
  }

  const handleAddCustomIngredient = () => {
      const customIngredient = searchTerm.trim();
      if(customIngredient && !internalSelection.includes(customIngredient)) {
        setInternalSelection([...internalSelection, customIngredient]);
      }
      setSearchTerm("");
  }
  
  const handleSave = () => {
    onIngredientsChange(internalSelection);
    onOpenChange(false);
  }

  const filteredIngredients = useMemo(() => {
    if (!searchTerm) return INGREDIENT_LIST
    return INGREDIENT_LIST.filter((ingredient) =>
      ingredient.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])
  
  const isCustomIngredient = searchTerm.trim() && !INGREDIENT_LIST.find(i => i.toLowerCase() === searchTerm.trim().toLowerCase());

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Ingredients</DialogTitle>
          <DialogDescription>
            Select from the list or add your own ingredients.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleAddCustomIngredient();
                }
              }}
              placeholder={"Search or add a new one..."}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-72 w-full rounded-md border p-2">
            <div className="space-y-2">
              {isCustomIngredient && (
                 <div 
                    className="flex items-center space-x-3 p-2 cursor-pointer hover:bg-muted rounded-md"
                    onClick={handleAddCustomIngredient}
                  >
                    <Checkbox checked={false} />
                    <span className="text-sm font-medium">{`Add "${searchTerm.trim()}"`}</span>
                 </div>
              )}
              {filteredIngredients.map((ingredient) => (
                <div
                  key={ingredient}
                  className="flex items-center space-x-3 p-2 cursor-pointer hover:bg-muted rounded-md"
                  onClick={() => handleToggleIngredient(ingredient)}
                >
                  <Checkbox
                    id={`ing-${ingredient}`}
                    checked={internalSelection.includes(ingredient)}
                    onCheckedChange={() => handleToggleIngredient(ingredient)}
                  />
                  <label
                    htmlFor={`ing-${ingredient}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {ingredient}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
           {internalSelection.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Ingredients</p>
              <div className="flex flex-wrap gap-2">
                {internalSelection.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="py-1 px-3 text-sm"
                  >
                    {ingredient}
                    <button
                      onClick={() => handleToggleIngredient(ingredient)}
                      className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      aria-label={`Remove ${ingredient}`}
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
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Add Ingredients</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
