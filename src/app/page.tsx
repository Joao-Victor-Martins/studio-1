import { DiameterCalculator } from '@/components/diameter-calculator';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8 justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
            CalculadoraDeDiâmetro Pro
          </h1>
          <p className="mt-2 text-muted-foreground">
            Calcule a porcentagem do diâmetro e o equilíbrio proporcional do peso com precisão.
          </p>
        </div>
        <DiameterCalculator />
      </div>
    </main>
  );
}
