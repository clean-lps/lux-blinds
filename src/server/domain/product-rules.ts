import { OrderItemSchema, type NormalizedOrderItem, type OrderItemInput, type ProductType } from '@/contracts/product-rules';
import type { ValidationResult } from '@/contracts/api';
import { suggestSnaps } from './snaps';

const RULE_VERSION = 'lux-observed-v1';

type ProductRules = {
  requires: Array<keyof OrderItemInput>;
  allows: Array<keyof OrderItemInput>;
  forceTrackSupplied?: boolean;
  snaps: boolean;
};

const PRODUCT_RULES: Record<ProductType, ProductRules> = {
  Roller: {
    requires: ['opening', 'track', 'fullness', 'installation', 'controlSide', 'operation'],
    allows: ['opening', 'track', 'trackOther', 'fullness', 'installation', 'controlSide', 'operation'],
    forceTrackSupplied: true,
    snaps: false,
  },
  Zebra: {
    requires: ['opening', 'track', 'fullness', 'installation', 'controlSide', 'operation'],
    allows: ['opening', 'track', 'trackOther', 'fullness', 'installation', 'controlSide', 'operation'],
    forceTrackSupplied: true,
    snaps: false,
  },
  'Ripple Fold': {
    requires: ['opening'],
    allows: ['opening', 'track', 'trackOther', 'fullness', 'installation', 'operation'],
    snaps: true,
  },
  'Pinch Pleat': {
    requires: ['opening'],
    allows: ['opening', 'track', 'trackOther', 'installation', 'operation'],
    snaps: false,
  },
  'Roman Shades': {
    requires: ['installation', 'controlSide', 'operation'],
    allows: ['installation', 'controlSide', 'operation'],
    forceTrackSupplied: true,
    snaps: false,
  },
  Other: {
    requires: ['opening'],
    allows: ['opening', 'track', 'trackOther', 'fullness', 'installation', 'controlSide', 'operation'],
    snaps: true,
  },
};

function fieldErrorsFromZod(error: { issues: Array<{ path: PropertyKey[]; message: string }> }): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((fieldErrors, issue) => {
    const field = String(issue.path[0] ?? 'form');
    (fieldErrors[field] ??= []).push(issue.message);
    return fieldErrors;
  }, {});
}

function addError(fieldErrors: Record<string, string[]>, field: string, message: string): void {
  (fieldErrors[field] ??= []).push(message);
}

function normalizedProductOther(productOther: string | undefined): string | undefined {
  const normalized = productOther?.trim().replace(/\s+/g, ' ');
  return normalized || undefined;
}

function effectiveProduct(item: Pick<OrderItemInput, 'productType' | 'productOther'>): ProductType {
  if (item.productType !== 'Other') return item.productType;

  const productOther = normalizedProductOther(item.productOther)?.toLocaleLowerCase();
  const matched = (Object.keys(PRODUCT_RULES) as ProductType[]).find(
    (productType) => productType !== 'Other' && productType.toLocaleLowerCase() === productOther,
  );
  return matched ?? 'Other';
}

function rulesFor(item: OrderItemInput): ProductRules {
  const productType = effectiveProduct(item);
  const rules = PRODUCT_RULES[productType];
  const trackSupplied = rules.forceTrackSupplied || item.trackSupplied;

  if (trackSupplied) {
    if (productType === 'Ripple Fold') {
      return { ...rules, requires: ['opening', 'track', 'fullness', 'installation', 'operation'] };
    }
    if (productType === 'Pinch Pleat') {
      return { ...rules, requires: ['opening', 'track', 'installation', 'operation'] };
    }
    if (productType === 'Other') {
      return { ...rules, requires: ['opening', 'track', 'fullness', 'installation', 'controlSide', 'operation'] };
    }
    return rules;
  }

  if (productType === 'Ripple Fold' || productType === 'Pinch Pleat') {
    return { ...rules, allows: ['opening'], requires: ['opening'] };
  }

  if (productType === 'Other') {
    return { ...rules, allows: ['opening', 'fullness'], requires: ['opening'] };
  }

  return rules;
}

function hasValue(value: unknown): boolean {
  return typeof value === 'string' ? value.trim().length > 0 : value !== undefined && value !== null;
}

export function validateOrderItem(input: unknown): ValidationResult<OrderItemInput> {
  const parsed = OrderItemSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  const item = parsed.data;
  const fieldErrors: Record<string, string[]> = {};
  const effectiveType = effectiveProduct(item);
  const rules = rulesFor(item);

  if (item.productType === 'Other' && !normalizedProductOther(item.productOther)) {
    addError(fieldErrors, 'productOther', 'required');
  }

  for (const field of rules.requires) {
    if (!hasValue(item[field])) addError(fieldErrors, field, 'required');
  }

  const trackVisible = rules.allows.includes('track');
  const requiresTrack = rules.requires.includes('track');
  if (trackVisible && requiresTrack && !hasValue(item.track)) addError(fieldErrors, 'track', 'required');
  if (trackVisible && item.track === 'Other' && !normalizedProductOther(item.trackOther)) {
    addError(fieldErrors, 'trackOther', 'required');
  }

  if (effectiveType === 'Other' && item.trackSupplied && !hasValue(item.track)) {
    addError(fieldErrors, 'track', 'required');
  }

  return Object.keys(fieldErrors).length > 0
    ? { success: false, fieldErrors }
    : { success: true, data: item };
}

export function normalizeOrderItem(input: OrderItemInput): NormalizedOrderItem {
  const rules = rulesFor(input);
  const normalized = { ...input } as OrderItemInput;
  const effectiveType = effectiveProduct(input);

  normalized.productOther = normalizedProductOther(input.productOther);
  if (rules.forceTrackSupplied) normalized.trackSupplied = true;

  const conditionalFields: Array<keyof OrderItemInput> = [
    'opening',
    'track',
    'trackOther',
    'fullness',
    'installation',
    'controlSide',
    'operation',
  ];
  for (const field of conditionalFields) {
    if (!rules.allows.includes(field)) delete normalized[field];
  }

  if (normalized.track !== 'Other') delete normalized.trackOther;
  else normalized.trackOther = normalizedProductOther(normalized.trackOther);

  const snapsApplicable = rules.snaps && !['Roller', 'Zebra', 'Pinch Pleat', 'Roman Shades'].includes(effectiveType);
  if (!snapsApplicable) delete normalized.snapsManual;
  else normalized.snapsManual = normalizedProductOther(normalized.snapsManual);

  const snapsSuggested = snapsApplicable
    ? suggestSnaps({ widthEighths: normalized.widthEighths, opening: normalized.opening ?? null, fullness: normalized.fullness ?? null })
    : null;
  const snapsSource = normalized.snapsManual ? 'manual' : snapsSuggested ? 'auto' : null;

  return {
    ...normalized,
    snapsSuggested,
    snapsSource,
    ruleVersion: RULE_VERSION,
  };
}
