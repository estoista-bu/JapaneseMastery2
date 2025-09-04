
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiService } from '@/lib/api';
import type { Deck } from "@/lib/types";

// Function to check if a name exactly matches a JLPT core deck name
const isExactJlptCoreName = (name: string) => {
  const normalizedName = name.toLowerCase().trim();
  return normalizedName.match(/^jlpt[\s-]n[1-5]$/);
};

const formSchema = z.object({
  name: z.string()
    .min(1, "Deck name is required.")
    .refine(
      (name) => !isExactJlptCoreName(name),
      "This name is reserved for JLPT core vocabulary decks. Please choose a different name."
    ),
  description: z.string().optional(),
});

type DeckFormData = z.infer<typeof formSchema>;

interface DeckFormProps {
  onSaveDeck: (data: DeckFormData, id?: string) => void;
  deckToEdit: Deck | null;
  onClose: () => void;
}

export function DeckForm({ onSaveDeck, deckToEdit, onClose }: DeckFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<DeckFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (deckToEdit) {
      form.reset({
        name: deckToEdit.name,
        description: deckToEdit.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [deckToEdit, form]);

    async function onSubmit(values: DeckFormData) {
      // Prevent double submission
      if (isSubmitting) {
        console.log('Form submission blocked - already submitting');
        return;
      }
      
      console.log('Form submission started:', values.name);
      setIsSubmitting(true);
      
      try {
        // Check for reserved names
        if (isExactJlptCoreName(values.name)) {
          throw new Error('This name is reserved for JLPT core vocabulary decks. Please choose a different name.');
        }
        
        // Let the parent handle all API calls to avoid duplication
        if (deckToEdit) {
          console.log('Updating deck via callback:', deckToEdit.slug);
        } else {
          console.log('Creating new deck via callback:', values.name);
        }
        
        await onSaveDeck(values, deckToEdit?.id);
        
        // Show success toast after the parent handles the API call
        toast({
          title: "Success!",
          description: deckToEdit 
            ? `The deck "${values.name}" has been updated.`
            : `The deck "${values.name}" has been created.`,
        });
        
        onClose();
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Check if this is a reserved name error from the backend
        const errorMessage = error instanceof Error ? error.message : "Failed to save deck";
        const isReservedNameError = errorMessage.toLowerCase().includes('reserved') || 
                                   errorMessage.toLowerCase().includes('jlpt');
        
        toast({
          title: isReservedNameError ? "Reserved Name" : "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          console.log('Form onSubmit triggered');
          form.handleSubmit(onSubmit)(e);
        }} 
        className="space-y-6 py-4" 
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deck Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Japanese Greetings" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="What is this deck about?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1 font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isSubmitting}
            onClick={(e) => {
              // Prevent any additional click handlers
              e.stopPropagation();
            }}
          >
            {isSubmitting ? "Saving..." : (deckToEdit ? "Update Deck" : "Create Deck")}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
