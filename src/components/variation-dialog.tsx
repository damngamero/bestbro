
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
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { LoaderCircle, Save } from "lucide-react"
import { type RecipeDetailsOutput } from "@/ai/flows/generate-recipe-details"
import { type RecipeVariationOutput } from "@/ai/flows/generate-recipe-variation"

type ModelId = 'googleai/gemini-2.5-flash' | 'googleai/gemini-2.5-pro';

interface VariationDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  recipeName: string
  recipeDetails: RecipeDetailsOutput
  apiKey: string | null
  model: ModelId
  onVariationCreated: (newRecipe: {name: string, details: RecipeDetailsOutput}, originalRecipeName: string) => void
}

export function VariationDialog({
  isOpen,
  onOpenChange,
  recipeName,
  recipeDetails,
  apiKey,
  model,
  onVariationCreated
}: VariationDialogProps) {
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>([])
  const [addons, setAddons] = useState<string>("")
  const [unavailableEquipment, setUnavailableEquipment] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [generatedVariation, setGeneratedVariation] = useState<RecipeVariationOutput | null>(null);
  const { toast } = useToast()

  const handleToggleExclude = (ingredient: string) => {
    setExcludeIngredients(
      excludeIngredients.includes(ingredient)
        ? excludeIngredients.filter((i) => i !== ingredient)
        : [...excludeIngredients, ingredient]
    )
  }

  const handleClose = () => {
    setExcludeIngredients([]);
    setAddons("");
    setUnavailableEquipment("");
    setGeneratedVariation(null);
    onOpenChange(false);
  }

  const handleGenerateVariation = async () => {
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: 'API Key Missing',
      })
      return
    }
    if (excludeIngredients.length === 0 && !addons.trim() && !unavailableEquipment.trim()) {
        toast({
            variant: "destructive",
            title: 'No Changes Requested',
            description: 'Please select an ingredient to remove or add a new one.',
        });
        return;
    }

    setIsLoading(true)
    setGeneratedVariation(null);
    try {
      const response = await fetch('/api/generate-variation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeName,
          ingredientsToExclude: excludeIngredients,
          addons: addons.split(',').map(a => a.trim()).filter(Boolean),
          unavailableEquipment: unavailableEquipment.split(',').map(e => e.trim()).filter(Boolean),
          apiKey,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result: RecipeVariationOutput = await response.json();
      
      if (result.possible && result.newRecipe) {
        // Instead of setting state, just call the callback directly
        onVariationCreated({
            name: result.newRecipe.name,
            details: result.newRecipe as RecipeDetailsOutput,
        }, recipeName);
      } else {
        toast({
          variant: "destructive",
          title: 'Variation Not Possible',
          description: result.reason || "The AI chef couldn't create a variation with the requested changes.",
          duration: 8000
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'Failed to generate variation. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) handleClose()}}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a Variation</DialogTitle>
          <DialogDescription>
            Modify '{recipeName}' by adding or removing ingredients, or noting unavailable equipment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <Label className="text-base font-medium">
              Remove Ingredients
            </Label>
            <p className="text-sm text-muted-foreground pb-2">
              Select ingredients from the original recipe to exclude.
            </p>
            <div className="space-y-2">
              {recipeDetails.ingredients.map((ingredient) => (
                <div key={ingredient} className="flex items-center space-x-2">
                  <Checkbox
                    id={`exclude-${ingredient}`}
                    checked={excludeIngredients.includes(ingredient)}
                    onCheckedChange={() => handleToggleExclude(ingredient)}
                  />
                  <label
                    htmlFor={`exclude-${ingredient}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {ingredient}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <Label htmlFor="addons" className="text-base font-medium">
              Try Different Add-ons
            </Label>
             <p className="text-sm text-muted-foreground pb-2">
              List new ingredients to add, separated by commas.
            </p>
            <Input
              id="addons"
              value={addons}
              onChange={(e) => setAddons(e.target.value)}
              placeholder={"e.g., Cayenne Pepper, Lime Juice"}
            />
          </div>
           <Separator />
          <div>
            <Label htmlFor="unavailable-equipment" className="text-base font-medium">
              Unavailable Equipment
            </Label>
             <p className="text-sm text-muted-foreground pb-2">
              List any equipment you don't have, separated by commas.
            </p>
            <Input
              id="unavailable-equipment"
              value={unavailableEquipment}
              onChange={(e) => setUnavailableEquipment(e.target.value)}
              placeholder={"e.g., Oven, Food Processor"}
            />
          </div>
        </div>
        <DialogFooter>
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleGenerateVariation} disabled={isLoading}>
                {isLoading && <LoaderCircle className="animate-spin mr-2" />}
                Generate and View
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
