import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Error de aplicación:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="bg-background flex min-h-screen items-center justify-center p-6">
          <Card className="max-w-lg">
            <CardHeader>
              <div className="bg-destructive/10 text-destructive mb-2 flex size-10 items-center justify-center rounded-lg">
                <AlertCircle className="size-5" />
              </div>
              <CardTitle>Algo salió mal</CardTitle>
              <CardDescription>
                La aplicación encontró un error inesperado. Tus datos en pantalla pueden no estar
                actualizados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Recarga la página para continuar. Si el problema persiste, prueba con menos archivos
                o en otra pestaña del navegador.
              </p>
              <Button onClick={() => window.location.reload()}>Recargar aplicación</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
