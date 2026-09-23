import { Dashboard } from '@/components/client/dashboard';
import { pageActor } from '@/server/auth/page-actor';
import { getDashboard } from '@/server/orders/queries';

export default async function MyPanelPage() {
  return <Dashboard data={await getDashboard(await pageActor())} />;
}
