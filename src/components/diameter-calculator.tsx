"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowDownUp, MoveHorizontal, Percent, Scale, Weight, MinusCircle } from "lucide-react";

const codes = [
  { code: "B3016", minDiameter: 216, maxDiameter: 910 },
  { code: "B3376", minDiameter: 216, maxDiameter: 890 },
  { code: "B2035", minDiameter: 150, maxDiameter: 660 },
  { code: "B1985", minDiameter: 150, maxDiameter: 680 },
  { code: "B2140", minDiameter: 150, maxDiameter: 700 },
  { code: "B2541", minDiameter: 150, maxDiameter: 480 },
  { code: "B6900", minDiameter: 216, maxDiameter: 880 },
  { code: "B3114", minDiameter: 216, maxDiameter: 910 },
  { code: "B2994", minDiameter: 216, maxDiameter: 950 },
  { code: "B2306", minDiameter: 216, maxDiameter: 880 },
  { code: "B7200", minDiameter: 216, maxDiameter: 870 },
  { code: "B5280", minDiameter: 216, maxDiameter: 900 },
  { code: "B2292", minDiameter: 150, maxDiameter: 630 },
  { code: "F2568", minDiameter: 216, maxDiameter: 950 },
  { code: "F2034", minDiameter: 216, maxDiameter: 910 },
  { code: "F2640", minDiameter: 216, maxDiameter: 920 },
  { code: "F1715", minDiameter: 150, maxDiameter: 660 },
  { code: "F1440", minDiameter: 150, maxDiameter: 720 },
  { code: "F1500", minDiameter: 150, maxDiameter: 720 },
  { code: "F2064", minDiameter: 150, maxDiameter: 710 },
  { code: "F2664", minDiameter: 216, maxDiameter: 940 },
  { code: "F2400", minDiameter: 216, maxDiameter: 900 },
  { code: "F2142", minDiameter: 150, maxDiameter: 730 },
  { code: "F2034S", minDiameter: 150, maxDiameter: 730 },
];

const formSchema = z.object({
  code: z.string({ required_error: "Insira um código." }).min(1, "Insira um código."),
  minDiameter: z.number(),
  maxDiameter: z.number(),
  consumedAmount: z.coerce.number().min(0, "O valor consumido não pode ser negativo."),
  totalWeight: z.coerce.number().positive("O peso total deve ser positivo."),
}).superRefine((data, ctx) => {
  if (data.maxDiameter > 0 && data.minDiameter > 0) {
      const maxPossibleConsumption = data.maxDiameter - data.minDiameter;
      if (data.consumedAmount > maxPossibleConsumption) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `O consumo máximo permitido é ${maxPossibleConsumption.toFixed(2)} mm (até chegar no mínimo)`,
          path: ["consumedAmount"],
        });
      }
  }
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  minDiameter: number;
  maxDiameter: number;
  consumedAmount: number;
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
      code: "",
      consumedAmount: 0,
      totalWeight: undefined,
      minDiameter: 0,
      maxDiameter: 0,
    },
    mode: "onChange",
  });

  const codeValue = form.watch("code");
  const minDiameter = form.watch("minDiameter");
  const maxDiameter = form.watch("maxDiameter");

  useEffect(() => {
    if (!codeValue) {
      form.setValue("minDiameter", 0);
      form.setValue("maxDiameter", 0);
      form.clearErrors("code");
      return;
    }

    const selectedCodeData = codes.find(c => c.code.toLowerCase() === codeValue?.toLowerCase());

    if (selectedCodeData) {
        form.setValue("minDiameter", selectedCodeData.minDiameter);
        form.setValue("maxDiameter", selectedCodeData.maxDiameter);
        form.clearErrors("code");
    } else {
        form.setValue("minDiameter", 0);
        form.setValue("maxDiameter", 0);
        form.setError("code", { type: "custom", message: "Código não encontrado." });
    }
  }, [codeValue, form]);

  function onSubmit(values: FormValues) {
    const minD = values.minDiameter;
    const maxD = values.maxDiameter;
    const consumed = values.consumedAmount;
    const totalW = values.totalWeight;

    if(minD === 0 && maxD === 0) {
        form.setError("code", { type: "custom", message: "Insira um código válido para calcular." });
        return;
    }
    
    // Cálculo do Diâmetro Atual
    const currentD = maxD - consumed;
    
    if (maxD - minD === 0) {
        setResult({
            minDiameter: minD,
            maxDiameter: maxD,
            consumedAmount: consumed,
            currentDiameter: currentD,
            totalWeight: totalW,
            diameterPercentage: 0,
            weightBalance: totalW,
        });
        return;
    }

    const diameterPercentage = ((currentD - minD) / (maxD - minD)) * 100;
    const weightBalance = totalW * (diameterPercentage / 100);

    setResult({
      minDiameter: minD,
      maxDiameter: maxD,
      consumedAmount: consumed,
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
          <CardTitle>Inserir Parâmetros</CardTitle>
          <CardDescription>Insira o código e quanto foi consumido para calcular o estado atual.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: B3016" {...field} />
                      </FormControl>
                      {(minDiameter > 0 || maxDiameter > 0) && (
                        <FormDescription>
                          Diâmetro: Mín {minDiameter}mm / Máx {maxDiameter}mm
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="consumedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consumido (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="Quanto foi retirado do diâmetro" {...field} value={field.value ?? ""} />
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
                    <FormLabel>Peso Total (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="ex: 1000" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Calcular
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle>Resultado do Cálculo</CardTitle>
            <CardDescription>
              Cálculo baseado no consumo informado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <ResultItem icon={ArrowDownUp} label="Intervalo de Diâmetro" value={`${result.minDiameter} - ${result.maxDiameter} mm`} />
                <ResultItem icon={MinusCircle} label="Consumido" value={`${result.consumedAmount} mm`} />
                <ResultItem icon={MoveHorizontal} label="Diâmetro Atual Calculado" value={`${result.currentDiameter.toFixed(2)} mm`} />
                <ResultItem icon={Weight} label="Peso Total Original" value={`${result.totalWeight} kg`} />
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4 text-center">
                <Percent className="h-8 w-8 text-primary mb-2" />
                <span className="text-xs text-muted-foreground">Porcentagem Restante</span>
                <span className="text-2xl font-bold text-primary">{result.diameterPercentage.toFixed(2)}%</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4 text-center">
                <Scale className="h-8 w-8 text-primary mb-2" />
                <span className="text-xs text-muted-foreground">Equilíbrio de Peso Atual</span>
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
