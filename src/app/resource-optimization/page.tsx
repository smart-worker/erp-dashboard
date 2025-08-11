"use client";

import { useActionState } from "react"; // Changed from 'react-dom'
import {
  fetchResourceOptimizationSuggestionsAction,
  type ActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFormStatus } from "react-dom"; // useFormStatus is still from react-dom

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Lightbulb className="mr-2 h-4 w-4" />
      )}
      Get Suggestions
    </Button>
  );
}

export default function ResourceOptimizationPage() {
  const initialState: ActionState = {};
  const [state, formAction] = useActionState(
    fetchResourceOptimizationSuggestionsAction,
    initialState
  ); // Changed here
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error && !state.fieldErrors) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
    if (state?.suggestions) {
      toast({
        title: "Suggestions Ready!",
        description: "AI-powered recommendations have been generated.",
      });
    }
  }, [state, toast]);

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Lightbulb className="h-7 w-7 text-primary" />
            AI-Powered Resource Optimization
          </CardTitle>
          <CardDescription>
            Leverage generative AI to get smart suggestions for optimizing
            resource allocation based on your college&apos;s data.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentEnrollment">Current Enrollment</Label>
                <Input
                  id="currentEnrollment"
                  name="currentEnrollment"
                  type="number"
                  placeholder="e.g., 2500"
                  required
                />
                {state?.fieldErrors?.currentEnrollment && (
                  <p className="text-sm text-destructive">
                    {state.fieldErrors.currentEnrollment.join(", ")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableBudget">Available Budget ($)</Label>
                <Input
                  id="availableBudget"
                  name="availableBudget"
                  type="number"
                  placeholder="e.g., 10000000"
                  required
                />
                {state?.fieldErrors?.availableBudget && (
                  <p className="text-sm text-destructive">
                    {state.fieldErrors.availableBudget.join(", ")}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="existingResources">Existing Resources</Label>
              <Textarea
                id="existingResources"
                name="existingResources"
                placeholder="Describe faculty, classrooms, labs, equipment, etc."
                rows={4}
                required
              />
              {state?.fieldErrors?.existingResources && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.existingResources.join(", ")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="historicalData">Historical Data Trends</Label>
              <Textarea
                id="historicalData"
                name="historicalData"
                placeholder="Summarize resource utilization and student outcomes from past few years."
                rows={4}
                required
              />
              {state?.fieldErrors?.historicalData && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.historicalData.join(", ")}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-end">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state?.suggestions && (
        <Card className="shadow-xl animate-fadeIn">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-primary">
                Suggestions:
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {state.suggestions}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary">
                Justification:
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {state.justification}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {state?.error && !state.fieldErrors && (
        <Alert variant="destructive" className="animate-fadeIn">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Add a simple fadeIn animation to globals.css or tailwind.config.js if desired
// For example, in tailwind.config.js under keyframes:
// 'fadeIn': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
// and under animation:
// 'fadeIn': 'fadeIn 0.5s ease-in-out',
// Then use `className="animate-fadeIn"`
