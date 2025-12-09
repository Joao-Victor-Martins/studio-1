"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowDownUp, MoveHorizontal, Percent, Scale, Weight } from "lucide-react";

const formSchema = z.object({
  minDiameter: z.string({ required_error: "Please select a minimum diameter." }),
  maxDiameter: z.string({ required_error: "Please select a maximum diameter." }),
  currentDiameter: z.coerce.number().min(1, "Current diameter must be positive."),
  totalWeight: z.coerce.number().min(1, "Total weight must be positive."),
}).superRefine((data, ctx) => {
  const min = parseFloat(data.minDiameter);
  const max = parseFloat(data.maxDiameter);

  if (!isNaN(min) && !isNaN(max) && (data.currentDiameter < min || data.currentDiameter > max)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Must be between ${min} and ${max} mm`,
      path: ["currentDiameter"],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  minDiameter: number;
  maxDiameter: number;
  currentDiameter: number;
  totalWeight: number;
  diameterPercentage: number;
  weightBalance: number;
}

export function DiameterCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minDiameter: "150",
      maxDiameter: "700",
      currentDiameter: undefined,
      totalWeight: undefined,
    },
  });

  function onSubmit(values: FormValues) {
    const minD = parseFloat(values.minDiameter);
    const maxD = parseFloat(values.maxDiameter);
    const currentD = values.currentDiameter;
    const totalW = values.totalWeight;

    const diameterPercentage = ((currentD - minD) / (maxD - minD)) * 100;
    const weightBalance = totalW * (diameterPercentage / 100);

    setResult({
      minDiameter: minD,
      maxDiameter: maxD,
      currentDiameter: currentD,
      totalWeight: totalW,
      diameterPercentage,
      weightBalance,
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enter Parameters</CardTitle>
          <CardDescription>Provide the details below to calculate the values.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="minDiameter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Diameter</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select min diameter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="150">150 mm</SelectItem>
                          <SelectItem value="216">216 mm</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxDiameter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Diameter</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select max diameter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="700">700 mm</SelectItem>
                          <SelectItem value="800">800 mm</SelectItem>
                          <SelectItem value="900">900 mm</SelectItem>
                          <SelectItem value="1000">1000 mm</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="currentDiameter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Diameter (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g., 450" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g., 1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Calculate
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle>Calculation Result</CardTitle>
            <CardDescription>Here is the breakdown based on your input.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <ResultItem icon={ArrowDownUp} label="Diameter Range" value={`${result.minDiameter} - ${result.maxDiameter} mm`} />
                <ResultItem icon={MoveHorizontal} label="Current Diameter" value={`${result.currentDiameter} mm`} />
                <ResultItem icon={Weight} label="Total Weight" value={`${result.totalWeight} kg`} />
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4 text-center">
                <Percent className="h-8 w-8 text-primary mb-2" />
                <span className="text-xs text-muted-foreground">Diameter Percentage</span>
                <span className="text-2xl font-bold text-primary">{result.diameterPercentage.toFixed(2)}%</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4 text-center">
                <Scale className="h-8 w-8 text-primary mb-2" />
                <span className="text-xs text-muted-foreground">Weight Balance</span>
                <span className="text-2xl font-bold text-primary">{result.weightBalance.toFixed(2)} kg</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResultItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="flex items-center space-x-3 rounded-md bg-muted/50 p-3">
      <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      <div className="flex-grow">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
