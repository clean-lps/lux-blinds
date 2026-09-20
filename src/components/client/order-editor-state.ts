import { FullnessSchema, OpeningSchema, OrderItemSchema, type OrderItemInput, type ProductType } from '@/contracts';
import type { z } from 'zod';

type Fullness = z.infer<typeof FullnessSchema>;
type Opening = z.infer<typeof OpeningSchema>;

export const productOptions: ProductType[] = ['Roller', 'Zebra', 'Ripple Fold', 'Pinch Pleat', 'Roman Shades', 'Other'];
export const openingOptions: Opening[] = ['C/O', 'O/W L', 'O/W R', 'Crazy Track. O/W', 'Crazy Track . C/O'];
export const fullnessOptions: Fullness[] = ['80%', '100%', '120%'];
export const fractionOptions = ['', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'] as const;
export const trackOptions = ['White', 'Black', 'Rod', 'Other'] as const;
export const installationOptions = ['Ceiling', 'Wall', 'IB', 'OB'] as const;
export const operationOptions = ['Manual', 'Motorized', 'Cord'] as const;

export type Fraction = (typeof fractionOptions)[number];
export type Track = (typeof trackOptions)[number];
export type BuilderDraft = {
  productType: ProductType;
  productOther: string;
  roomArea: string;
  fabricName: string;
  quantity: string;
  widthWhole: string;
  widthFraction: Fraction;
  heightWhole: string;
  heightFraction: Fraction;
  opening: Opening | '';
  trackSupplied: '' | 'yes' | 'no';
  track: Track | '';
  trackOther: string;
  fullness: Fullness | '';
  installation: (typeof installationOptions)[number] | '';
  controlSide: 'Left' | 'Right' | '';
  operation: (typeof operationOptions)[number] | '';
  snapsManual: string;
  notes: string;
};

export type BuilderErrors = Record<string, string>;

export type VisibleProductFields = {
  showProductOther: boolean;
  showOpening: boolean;
  showSupply: boolean;
  showTrack: boolean;
  showFullness: boolean;
  showInstallation: boolean;
  showControlSide: boolean;
  showOperation: boolean;
  showSnaps: boolean;
};

export const emptyBuilder: BuilderDraft = {
  productType: 'Other',
  productOther: '',
  roomArea: '',
  fabricName: '',
  quantity: '1',
  widthWhole: '',
  widthFraction: '',
  heightWhole: '',
  heightFraction: '',
  opening: '',
  trackSupplied: '',
  track: '',
  trackOther: '',
  fullness: '',
  installation: '',
  controlSide: '',
  operation: '',
  snapsManual: '',
  notes: '',
};

export function visibleProductFields(productType: ProductType, productOther: string, trackSupplied: '' | 'yes' | 'no'): VisibleProductFields {
  const normalizedOther = productOther.trim().toLowerCase();
  const otherExcluded = ['roller', 'zebra', 'pinch pleat', 'roman shades'].includes(normalizedOther);
  const forcedSupply = productType === 'Roller' || productType === 'Zebra' || productType === 'Roman Shades';
  const supplyYes = forcedSupply || trackSupplied === 'yes';
  const supplyNo = trackSupplied === 'no';
  const showSupply = !forcedSupply;
  const showOpening = productType !== 'Roman Shades';
  const showTrack = productType !== 'Roman Shades' && supplyYes;
  const otherNoFullness = ['ripple fold', 'pinch pleat', 'roman shades'].includes(normalizedOther);
  const showFullness = productType !== 'Pinch Pleat' && productType !== 'Roman Shades' && (!supplyNo || productType === 'Other') && !(productType === 'Other' && supplyNo && otherNoFullness);
  const showInstallation = productType !== 'Other' || !supplyNo;
  const showControlSide = productType === 'Roller' || productType === 'Zebra' || productType === 'Roman Shades' || (productType === 'Other' && !supplyNo);
  const showOperation = productType !== 'Other' || !supplyNo;
  const showSnaps = productType === 'Ripple Fold' || (productType === 'Other' && !otherExcluded);
  return { showProductOther: productType === 'Other', showOpening, showSupply, showTrack, showFullness, showInstallation, showControlSide, showOperation, showSnaps };
}

function fractionToEighths(fraction: Fraction) {
  return fractionOptions.indexOf(fraction);
}

export function measurementToEighths(whole: string, fraction: Fraction): number | null {
  if (!/^\d+$/.test(whole.trim())) return null;
  const value = Number.parseInt(whole, 10) * 8 + fractionToEighths(fraction);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function positiveInteger(value: string) {
  if (!/^\d+$/.test(value.trim())) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function visibleValue(value: string, visible: boolean) {
  return visible && value.trim() ? value.trim() : undefined;
}

export function sanitizeBuilderForProduct(draft: BuilderDraft): BuilderDraft {
  const fields = visibleProductFields(draft.productType, draft.productOther, draft.trackSupplied);
  const next = { ...draft };
  if (!fields.showProductOther) next.productOther = '';
  if (!fields.showOpening) next.opening = '';
  if (!fields.showSupply) next.trackSupplied = 'yes';
  if (!fields.showTrack) {
    next.track = '';
    next.trackOther = '';
  }
  if (!fields.showFullness) next.fullness = '';
  if (!fields.showInstallation) next.installation = '';
  if (!fields.showControlSide) next.controlSide = '';
  if (!fields.showOperation) next.operation = '';
  if (!fields.showSnaps) next.snapsManual = '';
  return next;
}

export function changeProduct(draft: BuilderDraft, productType: ProductType): BuilderDraft {
  return sanitizeBuilderForProduct({ ...draft, productType });
}

export function changeSupply(draft: BuilderDraft, trackSupplied: 'yes' | 'no'): BuilderDraft {
  return sanitizeBuilderForProduct({ ...draft, trackSupplied });
}

export function buildOrderItem(draft: BuilderDraft): { item: OrderItemInput | null; errors: BuilderErrors } {
  const clean = sanitizeBuilderForProduct(draft);
  const fields = visibleProductFields(clean.productType, clean.productOther, clean.trackSupplied);
  const errors: BuilderErrors = {};
  const quantity = positiveInteger(clean.quantity);
  const widthEighths = measurementToEighths(clean.widthWhole, clean.widthFraction);
  const heightEighths = measurementToEighths(clean.heightWhole, clean.heightFraction);
  if (!clean.fabricName.trim()) errors.fabricName = 'Fabric name is required.';
  if (!quantity) errors.quantity = 'Quantity must be a whole number greater than zero.';
  if (!widthEighths) errors.width = 'Width needs a positive whole number and optional eighths.';
  if (!heightEighths) errors.height = 'Height needs a positive whole number and optional eighths.';
  if (fields.showProductOther && !clean.productOther.trim()) errors.productOther = 'Describe the product type.';
  if (fields.showSupply && !clean.trackSupplied) errors.trackSupplied = 'Choose whether the track is supplied.';
  if (fields.showOpening && !clean.opening) errors.opening = 'Choose an opening.';
  if (fields.showTrack && !clean.track) errors.track = 'Choose a track.';
  if (fields.showTrack && clean.track === 'Other' && !clean.trackOther.trim()) errors.trackOther = 'Describe the track.';
  if (fields.showFullness && !clean.fullness) errors.fullness = 'Choose fullness.';
  if (fields.showInstallation && !clean.installation) errors.installation = 'Choose installation.';
  if (fields.showControlSide && !clean.controlSide) errors.controlSide = 'Choose a control side.';
  if (fields.showOperation && !clean.operation) errors.operation = 'Choose operation.';
  if (Object.keys(errors).length || !quantity || !widthEighths || !heightEighths) return { item: null, errors };

  const itemCandidate: OrderItemInput = {
    productType: clean.productType,
    fabricName: clean.fabricName.trim(),
    quantity,
    widthEighths,
    heightEighths,
    trackSupplied: fields.showSupply ? clean.trackSupplied === 'yes' : true,
    ...(visibleValue(clean.productOther, fields.showProductOther) ? { productOther: clean.productOther.trim() } : {}),
    ...(visibleValue(clean.roomArea, true) ? { roomArea: clean.roomArea.trim() } : {}),
    ...(fields.showOpening && clean.opening ? { opening: clean.opening } : {}),
    ...(fields.showTrack && clean.track ? { track: clean.track } : {}),
    ...(fields.showTrack && clean.track === 'Other' && clean.trackOther.trim() ? { trackOther: clean.trackOther.trim() } : {}),
    ...(fields.showFullness && clean.fullness ? { fullness: clean.fullness } : {}),
    ...(fields.showInstallation && clean.installation ? { installation: clean.installation } : {}),
    ...(fields.showControlSide && clean.controlSide ? { controlSide: clean.controlSide } : {}),
    ...(fields.showOperation && clean.operation ? { operation: clean.operation } : {}),
    ...(fields.showSnaps && visibleValue(clean.snapsManual, true) ? { snapsManual: clean.snapsManual.trim() } : {}),
    ...(visibleValue(clean.notes, true) ? { notes: clean.notes.trim() } : {}),
  };
  const parsed = OrderItemSchema.safeParse(itemCandidate);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors[String(issue.path[0] ?? 'item')] = issue.message;
    return { item: null, errors };
  }
  return { item: parsed.data, errors: {} };
}

function splitEighths(value: number): { whole: string; fraction: Fraction } {
  const whole = Math.floor(value / 8);
  const remainder = value % 8;
  return { whole: String(whole), fraction: (fractionOptions[remainder] ?? '') as Fraction };
}

export function builderFromOrderItem(item: OrderItemInput): BuilderDraft {
  const width = splitEighths(item.widthEighths);
  const height = splitEighths(item.heightEighths);
  return sanitizeBuilderForProduct({
    ...emptyBuilder,
    productType: item.productType,
    productOther: item.productOther ?? '',
    roomArea: item.roomArea ?? '',
    fabricName: item.fabricName,
    quantity: String(item.quantity),
    widthWhole: width.whole,
    widthFraction: width.fraction,
    heightWhole: height.whole,
    heightFraction: height.fraction,
    opening: item.opening ?? '',
    trackSupplied: item.trackSupplied ? 'yes' : 'no',
    track: item.track ?? '',
    trackOther: item.trackOther ?? '',
    fullness: item.fullness ?? '',
    installation: item.installation ?? '',
    controlSide: item.controlSide ?? '',
    operation: item.operation ?? '',
    snapsManual: item.snapsManual ?? '',
    notes: item.notes ?? '',
  });
}
