import DashboardLayout from "./(dashboard)/layout";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardView />
    </DashboardLayout>
  );
}
