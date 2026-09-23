import { beforeEach, expect, it, vi } from 'vitest';
import { ripple } from '../fixtures/catalog';
const db = vi.hoisted(() => ({ $transaction:vi.fn(), order:{findFirst:vi.fn(),updateMany:vi.fn(),create:vi.fn()}, orderItem:{deleteMany:vi.fn(),createMany:vi.fn(),findMany:vi.fn()}, attachment:{findMany:vi.fn(),updateMany:vi.fn()}, draft:{findFirst:vi.fn(),deleteMany:vi.fn()}, draftVersion:{deleteMany:vi.fn()}, idempotencyRecord:{findUnique:vi.fn(),create:vi.fn()}, orderRevision:{create:vi.fn()}, auditEvent:{create:vi.fn(),findMany:vi.fn()}, quote:{findUnique:vi.fn()} }));
vi.mock('@/server/db',()=>({db}));
import { createOrder } from '@/server/orders/create';
import { correctOrder, changeStatus, publishQuote } from '@/server/admin/orders';
const actor={userId:'u',organizationId:'org',role:'client' as const};
const input={sidemark:'Real',items:[ripple],specialNotes:'',attachmentIds:[] as string[]};
const row={id:'order',number:'ORD-1',sidemark:'Real',status:'received',revision:1,submittedAt:new Date(),specialNotes:'',items:[],attachments:[],quotes:[],organizationId:'org',organization:{companyName:'Real'},notes:[]};
beforeEach(()=>{vi.resetAllMocks();db.$transaction.mockImplementation(fn=>fn(db));db.auditEvent.findMany.mockResolvedValue([]);db.order.findFirst.mockResolvedValue(row);db.order.updateMany.mockResolvedValue({count:1});});
it('rejects foreign or unscanned attachments before creating an order',async()=>{
 db.idempotencyRecord.findUnique.mockResolvedValue(null);db.attachment.findMany.mockResolvedValue([]);
 await expect(createOrder(actor,{...input,attachmentIds:['00000000-0000-4000-8000-000000000001']},'key')).rejects.toMatchObject({status:422});
 expect(db.order.create).not.toHaveBeenCalled();
 expect(db.attachment.findMany).toHaveBeenCalledWith(expect.objectContaining({where:expect.objectContaining({organizationId:'org',uploadedBy:'u',scanStatus:'clean',orderId:null})}));
});
it('links uploaded photos and consumes the owned draft within the transaction',async()=>{
 const file='00000000-0000-4000-8000-000000000001',draft='00000000-0000-4000-8000-000000000002';
 db.idempotencyRecord.findUnique.mockResolvedValue(null);db.draft.findFirst.mockResolvedValue({id:draft});db.attachment.findMany.mockResolvedValue([{id:file}]);db.order.create.mockResolvedValue(row);db.attachment.updateMany.mockResolvedValue({count:1});db.draft.deleteMany.mockResolvedValue({count:1});db.orderItem.findMany.mockResolvedValue([{id:'item'}]);
 await createOrder(actor,{...input,draftId:draft,expectedDraftRevision:3,attachmentIds:[file]},'key');
 expect(db.attachment.updateMany).toHaveBeenCalledWith(expect.objectContaining({data:{orderId:'order'}}));
 expect(db.draft.deleteMany).toHaveBeenCalledWith({where:{id:draft,userId:'u',revision:3}});
 expect(db.idempotencyRecord.create).toHaveBeenCalled();
});
it('persists corrected models and audit instead of silently ignoring them',async()=>{
 await correctOrder({...actor,role:'admin'},'order',{expectedVersion:1,items:[ripple],reason:'Customer correction'});
 expect(db.orderItem.createMany).toHaveBeenCalledWith({data:[expect.objectContaining({fabricName:ripple.fabricName,orderId:'order',position:0})]});
 expect(db.orderRevision.create).toHaveBeenCalled();expect(db.auditEvent.create).toHaveBeenCalled();
});
it('rejects skipped status transitions',async()=>{
 await expect(changeStatus({...actor,role:'admin'},'order',{expectedVersion:1,status:'delivered'})).rejects.toMatchObject({status:422});
 expect(db.order.updateMany).not.toHaveBeenCalled();
});
it('does not let an operator publish another organization quote',async()=>{
 db.quote.findUnique.mockResolvedValue({order:{organizationId:'another',revision:1}});
 await expect(publishQuote({...actor,role:'operator'},'quote',1)).rejects.toMatchObject({status:404});
});
