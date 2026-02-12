import { BottomNav } from "@/components/bottom-nav";
import { OfflineIndicator } from "@/components/offline-indicator";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh pb-16">
      <OfflineIndicator />
      <main>{children}</main>
      <BottomNav />
    </div>
  );
}
