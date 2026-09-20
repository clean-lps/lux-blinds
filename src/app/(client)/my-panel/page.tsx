import { Dashboard } from '@/components/client/dashboard';
import { previewDashboard } from '@/components/client/presentation-data';

export default function MyPanelPage() {
  return <Dashboard data={previewDashboard} />;
}
