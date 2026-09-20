import {CustomerDetail} from '@/components/admin/customer-detail';

export default async function AdminCustomerPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  return <CustomerDetail customerId={id} />;
}
