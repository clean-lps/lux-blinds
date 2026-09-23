import {CustomerDetail} from '@/components/admin/customer-detail';
import { pageActor } from '@/server/auth/page-actor';

export default async function AdminCustomerPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const actor = await pageActor();
  return <CustomerDetail customerId={id} canReviewTax={actor.role === 'admin'} />;
}
