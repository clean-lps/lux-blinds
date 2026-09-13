import type { ClientOrderDTO } from '@/contracts/orders';
import { ripple } from './catalog';
export const order:ClientOrderDTO={id:'00000000-0000-4000-8000-000000000100',number:'DEMO-1001',sidemark:'DEMO-001',status:'received',revision:1,submittedAt:'2026-09-13T12:00:00.000Z',items:[{...ripple,id:'00000000-0000-4000-8000-000000000101',snapsSuggested:'27 / 27',snapsSource:'auto',ruleVersion:'lux-observed-v1'}],specialNotes:'',attachments:[],publishedQuote:null};
