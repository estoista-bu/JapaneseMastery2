
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lightbulb, CheckCircle2 } from 'lucide-react';
import { checkGrammar } from '@/ai/flows/grammar-checker-flow';
import { useToast } from '@/hooks/use-toast';
import type { GrammarCheckOutput } from '@/lib/types';


export function GrammarChecker() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<GrammarCheckOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckGrammar = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter some Japanese text to check.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await checkGrammar({ text: inputText });
      setResult(response);
    } catch (error) {
      console.error('Grammar check failed:', error);
      toast({
        title: 'An Error Occurred',
        description: 'Failed to check grammar. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="p-4">
          <Textarea
            placeholder="ここに日本語の文章を入力してください... (e.g., 私の犬は速い走る)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[120px] text-base"
            disabled={isLoading}
          />
          <Button onClick={handleCheckGrammar} disabled={isLoading} className="w-full mt-4">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Grammar'
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300 [&>svg]:text-orange-600">
                <AlertDescription className="text-xs">
                    AI can make mistakes, please confirm with external source if unsure.
                </AlertDescription>
            </Alert>
            {result.corrections.length === 0 ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Excellent!</AlertTitle>
                <AlertDescription>{result.overallFeedback}</AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Feedback</AlertTitle>
                  <AlertDescription>{result.overallFeedback}</AlertDescription>
                </Alert>
                <div className="space-y-4">
                  {result.corrections.map((correction, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-red-600 dark:text-red-400 line-through">
                        {correction.mistake}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-1">
                        {correction.suggestion}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">{correction.explanation}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
