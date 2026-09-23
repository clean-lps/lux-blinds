'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AttachmentDTO, OrderItemInput } from '@/contracts';
import { apiErrorMessage, ClientApiError } from './api';
import { ClientField, ClientShell } from './client-shell';
import { DraftStatus } from './draft-status';
import { orderApi } from './order-api';
import { buildOrderItem, changeProduct, changeSupply, emptyBuilder, fractionOptions, fullnessOptions, installationOptions, openingOptions, operationOptions, productOptions, sanitizeBuilderForProduct, trackOptions, type BuilderDraft, type Fraction, visibleProductFields } from './order-editor-state';
import { OrderReview } from './order-review';
import { OrderUploads, type PendingUpload } from './order-uploads';
import styles from './client-ui.module.css';

type BuilderItem = { id: string; item: OrderItemInput };

function nextId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function SelectField({ id, label, value, options, onChange, error, disabled = false }: { id: string; label: string; value: string; options: readonly string[]; onChange: (value: string) => void; error?: string; disabled?: boolean }) {
  return <ClientField id={id} label={label} error={error}><select id={id} className={`${styles.select} ${disabled ? styles.disabledField : ''}`} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}><option value="">Select…</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></ClientField>;
}

export function OrderBuilder() {
  const router = useRouter();
  const [sidemark, setSidemark] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [builder, setBuilder] = useState<BuilderDraft>({ ...emptyBuilder });
  const [items, setItems] = useState<BuilderItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [builderError, setBuilderError] = useState<string | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<'idle' | 'pending' | 'saved' | 'offline' | 'conflict' | 'error'>('idle');
  const [requiresPhotoReselection, setRequiresPhotoReselection] = useState(false);
  const submissionKeyRef = useRef<string | null>(null);
  const draftRef = useRef<{ id: string; revision: number } | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const saveBlocked = useRef(false);
  const submittingRef = useRef(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const fields = useMemo(() => sanitizeBuilderForProduct(builder), [builder]);
  const visible = useMemo(() => visibleProductFields(fields.productType, fields.productOther, fields.trackSupplied), [fields]);

  useEffect(() => {
    setRequiresPhotoReselection(new URLSearchParams(window.location.search).has('draft'));
  }, []);

  useEffect(() => {
    let active = true;
    orderApi.getDraft().then((serverDraft) => {
      if (!active) return;
      if (serverDraft) {
        draftRef.current = { id: serverDraft.id, revision: serverDraft.revision };
        setSidemark(serverDraft.sidemark);
        setItems(serverDraft.items.map(item => ({ id: nextId(), item })));
        setSpecialNotes(serverDraft.specialNotes || '');
        setRequiresPhotoReselection(serverDraft.requiresPhotoReselection);
        setDraftStatus('saved');
      }
      setDraftLoaded(true);
    }).catch((error) => { if (active) { setDraftStatus('error'); setSubmitError(apiErrorMessage(error)); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!draftLoaded || submitting || submittedOrder || saveBlocked.current) return;
    if (!sidemark.trim() && !items.length && !specialNotes.trim() && !draftRef.current) return undefined;
    setDraftStatus('pending');
    const timer = window.setTimeout(() => {
      saveQueue.current = saveQueue.current.then(async () => {
        if (saveBlocked.current || submittingRef.current) return;
        try {
          const saved = await orderApi.saveDraft({ expectedRevision: draftRef.current?.revision ?? 0, schemaVersion: 1, sidemark: sidemark.trim(), items: items.map(e => e.item), builder: {}, specialNotes });
          draftRef.current = { id: saved.id, revision: saved.revision };
          setDraftStatus('saved');
        } catch (error) {
          saveBlocked.current = true;
          setDraftStatus(error instanceof ClientApiError && error.status === 409 ? 'conflict' : 'error');
          setSubmitError(`${apiErrorMessage(error)} Reload this page before continuing.`);
        }
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [items, sidemark, specialNotes, draftLoaded, submitting, submittedOrder]);

  function updateBuilder(next: Partial<BuilderDraft>) {
    setBuilder(sanitizeBuilderForProduct({ ...builder, ...next }));
    setBuilderError(null);
  }

  function handleProductChange(productType: string) {
    if (!productOptions.includes(productType as (typeof productOptions)[number])) return;
    setBuilder(changeProduct(builder, productType as BuilderDraft['productType']));
    setBuilderError(null);
  }

  function handleSupplyChange(value: string) {
    if (value !== 'yes' && value !== 'no') return;
    setBuilder(changeSupply(builder, value));
    setBuilderError(null);
  }

  function handleAddItem() {
    const result = buildOrderItem(builder);
    if (!result.item) {
      setBuilderError(Object.values(result.errors)[0] ?? 'Check the model fields before adding it.');
      return;
    }
    if (editingId) {
      setItems((current) => current.map((entry) => entry.id === editingId ? { ...entry, item: result.item! } : entry));
      setEditingId(null);
    } else {
      setItems((current) => [...current, { id: nextId(), item: result.item! }]);
    }
    setBuilder({ ...emptyBuilder });
    setBuilderError(null);
    setItemsError(null);
  }

  function editItem(entry: BuilderItem) {
    const source = entry.item;
    setBuilder({ ...emptyBuilder, productType: source.productType, productOther: source.productOther ?? '', roomArea: source.roomArea ?? '', fabricName: source.fabricName, quantity: String(source.quantity), widthWhole: String(Math.floor(source.widthEighths / 8)), widthFraction: fractionOptions[source.widthEighths % 8] as Fraction, heightWhole: String(Math.floor(source.heightEighths / 8)), heightFraction: fractionOptions[source.heightEighths % 8] as Fraction, opening: source.opening ?? '', trackSupplied: source.trackSupplied ? 'yes' : 'no', track: source.track ?? '', trackOther: source.trackOther ?? '', fullness: source.fullness ?? '', installation: source.installation ?? '', controlSide: source.controlSide ?? '', operation: source.operation ?? '', snapsManual: source.snapsManual ?? '', notes: source.notes ?? '' });
    setEditingId(entry.id);
    setBuilderError(null);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((entry) => entry.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setBuilder({ ...emptyBuilder });
    }
  }

  async function submitOrder() {
    if (!sidemark.trim()) {
      setSubmitError('Sidemark is required before submitting.');
      return;
    }
    if (!items.length) {
      setSubmitError('Add at least one model before submitting.');
      return;
    }
    if (uploads.some(entry => entry.status !== 'uploaded' || !entry.intent)) {
      setSubmitError('Upload every selected photo successfully, or remove it, before submitting.');
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    submittingRef.current = true;
    const idempotencyKey = submissionKeyRef.current ?? nextId();
    submissionKeyRef.current = idempotencyKey;
    try {
      await saveQueue.current;
      if (saveBlocked.current) throw new Error('Draft conflict');
      const draft = draftRef.current;
      const order = await orderApi.createOrder({ ...(draft ? { draftId: draft.id, expectedDraftRevision: draft.revision } : {}), sidemark: sidemark.trim(), items: items.map((entry) => entry.item), specialNotes, attachmentIds: uploads.map(entry => entry.intent!.attachmentId) }, idempotencyKey);
      setSubmittedOrder(order.number);
      setReviewOpen(false);
      submissionKeyRef.current = null;
      router.push(`/orders/${order.id}`);
      router.refresh();
    } catch (error) {
      setSubmitError(apiErrorMessage(error));
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  const common = { className: styles.input };
  return (
    <ClientShell title="New Order" description="Add one or multiple curtains/models to the same order." active="new-order">
      <section className={styles.surface}>
        <div className={styles.info}><p>Your added models and order notes are saved to your account. Upload selected photos before submitting.</p></div>
        <div className={styles.buttonRow} style={{ marginTop: 18 }}><DraftStatus status={draftStatus} /><span className={styles.spacer} /><span className={styles.small}>{draftLoaded ? 'Automatic draft saving enabled.' : 'Loading your saved draft…'}</span></div>
        <fieldset disabled={!draftLoaded || submitting || !!submittedOrder || saveBlocked.current} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>

        <div className={styles.builderSection}>
          <ClientField id="sidemark" label="Sidemark *" error={!sidemark.trim() ? 'Sidemark is required before review.' : undefined}>
            <input {...common} id="sidemark" value={sidemark} onChange={(event) => setSidemark(event.target.value)} placeholder="Project or customer reference" aria-required="true" />
          </ClientField>
        </div>

        <section className={styles.builderSection} aria-labelledby="model-heading">
          <div className={styles.builderHeader}><h2 id="model-heading">{editingId ? 'Edit Curtain / Model' : 'Add Curtain / Model'}</h2><p>Fields are cleared when a product rule makes them unavailable.</p></div>
          {builderError ? <div className={styles.error} role="alert"><p>{builderError}</p></div> : null}
          <div className={styles.twoColumns}>
            <ClientField id="roomArea" label="Room / Area"><input {...common} id="roomArea" value={fields.roomArea} onChange={(event) => updateBuilder({ roomArea: event.target.value })} placeholder="Living room" /></ClientField>
            <SelectField id="productType" label="Product Type *" value={fields.productType} options={productOptions} onChange={handleProductChange} />
            {visible.showProductOther ? <ClientField id="productOther" label="Describe Product Type" error={builderError && !fields.productOther.trim() ? 'Describe the product type.' : undefined}><input {...common} id="productOther" value={fields.productOther} onChange={(event) => updateBuilder({ productOther: event.target.value })} placeholder="Custom product" /></ClientField> : null}
            <ClientField id="fabricName" label="Fabric Name *"><input {...common} id="fabricName" value={fields.fabricName} onChange={(event) => updateBuilder({ fabricName: event.target.value })} placeholder="Enter value" /></ClientField>
          </div>
          <div className={styles.twoColumns}>
            <ClientField id="width" label="Width *" error={builderError && !fields.widthWhole.trim() ? 'Width is required.' : undefined}>
              <div className={styles.twoColumns}><input {...common} id="width" inputMode="numeric" value={fields.widthWhole} onChange={(event) => updateBuilder({ widthWhole: event.target.value.replace(/\D/g, '') })} placeholder="Whole" /><select className={styles.select} aria-label="Width fraction" value={fields.widthFraction} onChange={(event) => updateBuilder({ widthFraction: event.target.value as Fraction })}>{fractionOptions.map((option) => <option key={option} value={option}>{option || 'No fraction'}</option>)}</select></div>
            </ClientField>
            <ClientField id="height" label="Height *" error={builderError && !fields.heightWhole.trim() ? 'Height is required.' : undefined}>
              <div className={styles.twoColumns}><input {...common} id="height" inputMode="numeric" value={fields.heightWhole} onChange={(event) => updateBuilder({ heightWhole: event.target.value.replace(/\D/g, '') })} placeholder="Whole" /><select className={styles.select} aria-label="Height fraction" value={fields.heightFraction} onChange={(event) => updateBuilder({ heightFraction: event.target.value as Fraction })}>{fractionOptions.map((option) => <option key={option} value={option}>{option || 'No fraction'}</option>)}</select></div>
            </ClientField>
            <ClientField id="quantity" label="Quantity *"><input {...common} id="quantity" inputMode="numeric" value={fields.quantity} onChange={(event) => updateBuilder({ quantity: event.target.value.replace(/\D/g, '') })} /></ClientField>
          </div>
          {visible.showOpening ? <SelectField id="opening" label="Opening *" value={fields.opening} options={openingOptions} onChange={(opening) => updateBuilder({ opening: opening as BuilderDraft['opening'] })} /> : null}
          {visible.showSupply ? <fieldset className={styles.form} style={{ gap: 8 }}><legend className={styles.label}>Track supplied *</legend><div className={styles.choiceRow}><label className={styles.choice}><input className={styles.radio} type="radio" name="trackSupplied" checked={fields.trackSupplied === 'yes'} onChange={() => handleSupplyChange('yes')} /> Yes</label><label className={styles.choice}><input className={styles.radio} type="radio" name="trackSupplied" checked={fields.trackSupplied === 'no'} onChange={() => handleSupplyChange('no')} /> No</label></div></fieldset> : null}
          {visible.showTrack ? <div className={styles.twoColumns}><SelectField id="track" label="Track" value={fields.track} options={trackOptions} onChange={(track) => updateBuilder({ track: track as BuilderDraft['track'] })} /><ClientField id="trackOther" label="Other track" error={builderError && fields.track === 'Other' && !fields.trackOther.trim() ? 'Describe the track.' : undefined}><input {...common} id="trackOther" value={fields.trackOther} onChange={(event) => updateBuilder({ trackOther: event.target.value })} disabled={fields.track !== 'Other'} className={`${styles.input} ${fields.track !== 'Other' ? styles.disabledField : ''}`} /></ClientField></div> : null}
          {visible.showFullness ? <SelectField id="fullness" label="Fullness" value={fields.fullness} options={fullnessOptions} onChange={(fullness) => updateBuilder({ fullness: fullness as BuilderDraft['fullness'] })} /> : null}
          <div className={styles.threeColumns}>
            {visible.showInstallation ? <SelectField id="installation" label="Installation" value={fields.installation} options={installationOptions} onChange={(installation) => updateBuilder({ installation: installation as BuilderDraft['installation'] })} /> : null}
            {visible.showControlSide ? <SelectField id="controlSide" label="Control Side" value={fields.controlSide} options={['Left', 'Right']} onChange={(controlSide) => updateBuilder({ controlSide: controlSide as BuilderDraft['controlSide'] })} /> : null}
            {visible.showOperation ? <SelectField id="operation" label="Operation" value={fields.operation} options={operationOptions} onChange={(operation) => updateBuilder({ operation: operation as BuilderDraft['operation'] })} /> : null}
          </div>
          {visible.showSnaps ? <ClientField id="snapsManual" label="Manual Snaps (optional)" hint="Automatic snaps are calculated and versioned by the server after save."><input {...common} id="snapsManual" value={fields.snapsManual} onChange={(event) => updateBuilder({ snapsManual: event.target.value })} placeholder="Leave blank for server calculation" /></ClientField> : null}
          <ClientField id="modelNotes" label="Model Notes"><textarea {...common} className={styles.textarea} id="modelNotes" value={fields.notes} onChange={(event) => updateBuilder({ notes: event.target.value })} maxLength={4000} /></ClientField>
          <div className={styles.buttonRow}><button className={styles.button} type="button" onClick={handleAddItem}>{editingId ? 'Save model' : 'Add model to order'}</button>{editingId ? <button className={styles.buttonSecondary} type="button" onClick={() => { setEditingId(null); setBuilder({ ...emptyBuilder }); }}>Cancel edit</button> : null}</div>
        </section>

        <section className={styles.builderSection} aria-labelledby="models-heading">
          <div className={styles.surfaceHeader}><div><h2 id="models-heading" className={styles.surfaceTitle}>Models in this order</h2><p className={styles.surfaceIntro}>{items.length ? `${items.reduce((total, entry) => total + entry.item.quantity, 0)} total units across ${items.length} model${items.length === 1 ? '' : 's'}.` : 'Add your first model above.'}</p></div></div>
          {items.length ? <ul className={styles.list}>{items.map((entry) => <li className={styles.listItem} key={entry.id}><div className={styles.listItemMain}><h3 className={styles.listItemTitle}>{entry.item.productType} · {entry.item.fabricName}</h3><p className={styles.listItemMeta}>{entry.item.quantity} units · {entry.item.widthEighths / 8}" W × {entry.item.heightEighths / 8}" H · {entry.item.snapsManual ? `manual snaps ${entry.item.snapsManual}` : 'snaps by server'}</p></div><div className={styles.buttonRow}><button className={styles.buttonSecondary} type="button" onClick={() => editItem(entry)}>Edit</button><button className={styles.buttonDanger} type="button" onClick={() => removeItem(entry.id)}>Remove</button></div></li>)}</ul> : <div className={styles.empty}><div><h3 className={styles.emptyTitle}>No models yet.</h3><p className={styles.emptyText}>Start with product type, fabric and dimensions. You can add multiple models before reviewing.</p></div></div>}
          {itemsError ? <p className={styles.fieldError}>{itemsError}</p> : null}
        </section>

        <div className={styles.sectionBreak} />

        <div className={styles.sectionGroup}><h2 className={styles.sectionGroupTitle}>Order Notes</h2><p className={styles.sectionGroupIntro}>General observations for this order.</p></div>
        <ClientField id="specialNotes" label="Special Notes"><textarea {...common} className={styles.textarea} id="specialNotes" value={specialNotes} onChange={(event) => setSpecialNotes(event.target.value)} maxLength={8000} placeholder="General notes for this order" /></ClientField>
        <OrderUploads value={uploads} onChange={setUploads} requiresReselection={requiresPhotoReselection} />
        {submittedOrder ? <div className={styles.success} role="status"><p>Order {submittedOrder} was accepted by the API.</p></div> : null}
        {submitError ? <div className={styles.error} role="alert"><p>{submitError}</p></div> : null}
        <div className={styles.buttonRow}><span className={styles.spacer} /><button className={styles.button} type="button" disabled={!items.length || !sidemark.trim()} onClick={() => { setSubmitError(null); submissionKeyRef.current = submissionKeyRef.current ?? nextId(); setReviewOpen(true); }}>Review order</button></div>
        </fieldset>
      </section>
      <OrderReview open={reviewOpen} sidemark={sidemark} items={items} notes={specialNotes} attachments={uploads.map((entry): AttachmentDTO => ({ id: entry.id, name: entry.file.name, mediaType: entry.file.type || 'application/octet-stream', byteSize: entry.file.size, scanStatus: entry.status === 'uploaded' ? 'clean' : 'pending', uploadStatus: entry.status === 'uploaded' ? 'uploaded' : 'pending' }))} error={submitError} submitting={submitting} onClose={() => { if (!submitting) setReviewOpen(false); }} onSubmit={submitOrder} />
    </ClientShell>
  );
}
