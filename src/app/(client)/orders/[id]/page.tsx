import { OrderDetail } from '@/components/client/order-detail';
import { previewOrders } from '@/components/client/presentation-data';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = previewOrders.find((candidate) => candidate.id === id);
  return <OrderDetail order={order} orderId={id} />;
}
