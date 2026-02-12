"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Download,
  Info,
  Loader2,
  Smartphone,
  TestTube,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { useNotifications } from "@/hooks/use-notifications";

export default function SettingsPage() {
  const { canInstall, isInstalled, install } = useInstallPrompt();
  const { permission, isSubscribed, subscribe, unsubscribe } =
    useNotifications();
  const [isInstallingPwa, setIsInstallingPwa] = useState(false);
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  async function handleInstall() {
    setIsInstallingPwa(true);
    try {
      await install();
    } catch {
      // User dismissed
    } finally {
      setIsInstallingPwa(false);
    }
  }

  async function handleToggleNotifications() {
    setIsTogglingNotifications(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch {
      // Permission denied or error
    } finally {
      setIsTogglingNotifications(false);
    }
  }

  async function handleTestNotification() {
    setIsSendingTest(true);
    setTestSent(false);
    try {
      const res = await fetch("/api/push/test", {
        method: "POST",
      });
      if (res.ok) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3000);
      }
    } catch {
      // Error sending test
    } finally {
      setIsSendingTest(false);
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Configuracion</h1>
          <p className="text-xs text-muted-foreground">
            Ajusta tu experiencia
          </p>
        </div>
      </div>

      {/* PWA Install */}
      <Card className="py-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Instalar App
          </CardTitle>
          <CardDescription className="text-xs">
            Instala Boyfriend OS como app nativa en tu dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isInstalled ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              App instalada
            </div>
          ) : canInstall ? (
            <Button
              onClick={handleInstall}
              disabled={isInstallingPwa}
              className="w-full gap-2"
            >
              {isInstallingPwa ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Instalando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Instalar como PWA
                </>
              )}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Abre esta pagina en Chrome o Safari para poder instalar la app.
              Si ya la instalaste, estara en tu pantalla de inicio.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="py-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </CardTitle>
          <CardDescription className="text-xs">
            Recibe recordatorios de eventos y sugerencias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                {isSubscribed ? "Activadas" : "Desactivadas"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Permiso: {permission}
              </p>
            </div>
            <Button
              variant={isSubscribed ? "outline" : "default"}
              size="sm"
              onClick={handleToggleNotifications}
              disabled={isTogglingNotifications || permission === "denied"}
              className="gap-1.5"
            >
              {isTogglingNotifications ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isSubscribed ? (
                <BellOff className="h-3.5 w-3.5" />
              ) : (
                <Bell className="h-3.5 w-3.5" />
              )}
              {isSubscribed ? "Desactivar" : "Activar"}
            </Button>
          </div>

          {permission === "denied" && (
            <p className="text-xs text-destructive">
              Las notificaciones fueron bloqueadas. Debes habilitarlas desde la
              configuracion del navegador.
            </p>
          )}

          {isSubscribed && (
            <>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                disabled={isSendingTest}
                className="w-full gap-1.5"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Enviando...
                  </>
                ) : testSent ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Notificacion enviada!
                  </>
                ) : (
                  <>
                    <TestTube className="h-3.5 w-3.5" />
                    Enviar notificacion de prueba
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="py-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Informacion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">App</span>
            <span className="font-medium">Boyfriend OS</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Version</span>
            <Badge variant="secondary" className="text-xs">
              1.0.0
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Proposito</span>
            <span className="text-xs text-right max-w-[200px]">
              Herramienta de apoyo emocional para relaciones
            </span>
          </div>
          <Separator />
          <p className="text-[10px] text-muted-foreground text-center pt-2">
            Esta app no reemplaza terapia profesional.
            Es una herramienta de apoyo para comunicarte mejor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
