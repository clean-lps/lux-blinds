import { OrderHistory } from '@/components/client/order-history';
import { previewOrders } from '@/components/client/presentation-data';

export default function OrderHistoryPage() {
  return <OrderHistory orders={previewOrders} />;
}
