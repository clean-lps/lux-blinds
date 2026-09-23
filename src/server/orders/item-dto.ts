import { OrderItemSchema, type NormalizedOrderItem } from '@/contracts/product-rules';
/** Database nullable/internal columns are not part of the public item contract. */
export function orderItemDTO(item: any): NormalizedOrderItem & { id: string } {
  const input = Object.fromEntries(Object.entries(item).filter(([key,value]) => key in OrderItemSchema.shape && value != null));
  return { ...OrderItemSchema.parse(input), id:item.id, snapsSuggested:item.snapsSuggested??null, snapsSource:item.snapsSource??null, ruleVersion:item.ruleVersion };
}
