"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-bold text-foreground">Sin conexion</h1>
        <p className="text-muted-foreground max-w-sm">
          No tienes conexion a internet. Algunas funciones estan disponibles offline.
          Vuelve a intentar cuando te reconectes.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-primary px-6 py-2 text-primary-foreground"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
