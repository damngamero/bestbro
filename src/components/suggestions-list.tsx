"use client";

import { LoaderCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SuggestionsListProps {
  suggestions: string[];
  isLoading: boolean;
  onSelect: (suggestion: string) => void;
}

export function SuggestionsList({ suggestions, isLoading, onSelect }: SuggestionsListProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-4 flex items-center justify-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-2">
        <ul className="space-y-1">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                onClick={() => onSelect(suggestion)}
                className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors text-sm"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
