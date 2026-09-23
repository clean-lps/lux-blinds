// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ripple } from '../fixtures/catalog';
import { profile } from '../fixtures/profile';
const mocks = vi.hoisted(() => ({ getDraft: vi.fn(), saveDraft: vi.fn(), createOrder: vi.fn(), push: vi.fn(), getProfile: vi.fn(), updateProfile: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push, refresh: vi.fn() }) }));
vi.mock('@/components/client/order-api', () => ({ orderApi: mocks }));
vi.mock('@/components/client/account-api', () => ({ getProfile: mocks.getProfile, updateProfile: mocks.updateProfile, changePassword: vi.fn(), updateConsent: vi.fn() }));
vi.mock('@/components/client/order-uploads', () => ({ OrderUploads: ({ onChange }: any) => <button onClick={() => onChange([{id:'file',file:new File(['photo'],'photo.png',{type:'image/png'}),status:'uploaded',intent:{attachmentId:'attachment-1'}}])}>Attach uploaded photo</button> }));
import { OrderBuilder } from '@/components/client/order-builder';
import { ProfileForm } from '@/components/client/profile-form';
beforeEach(() => { vi.resetAllMocks(); mocks.getProfile.mockResolvedValue(profile); });
afterEach(cleanup);
it('starts blank with no demo reference and saves the server revision', async () => {
  mocks.getDraft.mockResolvedValue(null);
  mocks.saveDraft.mockResolvedValue({id:'draft',revision:1});
  render(<OrderBuilder />);
  await waitFor(() => expect(screen.getByLabelText('Sidemark *')).toBeEnabled());
  expect(screen.getByLabelText('Sidemark *')).toHaveValue('');
  expect(screen.queryByText(/Synthetic state/)).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Sidemark *'), {target:{value:'Actual project'}});
  await waitFor(() => expect(mocks.saveDraft).toHaveBeenCalledWith(expect.objectContaining({expectedRevision:0,sidemark:'Actual project'})), {timeout:3000});
  await screen.findByText('Draft saved');
});
it('restores saved models and submits uploaded attachment IDs with the draft revision', async () => {
  mocks.getDraft.mockResolvedValue({id:'draft',revision:7,sidemark:'Real project',items:[ripple],specialNotes:'',requiresPhotoReselection:true});
  mocks.createOrder.mockResolvedValue({id:'order-1',number:'ORD-1'});
  render(<OrderBuilder />);
  await screen.findByText(/Ripple Fold ·/);
  fireEvent.click(screen.getByText('Attach uploaded photo'));
  fireEvent.click(screen.getByRole('button',{name:'Review order'}));
  fireEvent.click(screen.getByRole('button',{name:'Submit order'}));
  await waitFor(() => expect(mocks.createOrder).toHaveBeenCalledWith(expect.objectContaining({draftId:'draft',expectedDraftRevision:7,attachmentIds:['attachment-1'],items:[ripple]}),expect.any(String)));
  await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/orders/order-1'));
});
it('does not display saved when autosave fails', async () => {
  mocks.getDraft.mockResolvedValue(null); mocks.saveDraft.mockRejectedValue(new Error('offline'));
  render(<OrderBuilder />);
  await waitFor(() => expect(screen.getByLabelText('Sidemark *')).toBeEnabled());
  fireEvent.change(screen.getByLabelText('Sidemark *'), {target:{value:'Actual project'}});
  await screen.findByText('Could not save draft', {}, {timeout:3000});
  expect(screen.queryByText('Draft saved')).not.toBeInTheDocument();
});
it('uses the returned profile revision for successive saves', async () => {
  mocks.updateProfile.mockResolvedValue({...profile,revision:2});
  render(<ProfileForm initialProfile={profile} />);
  await waitFor(() => expect(mocks.getProfile).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button',{name:'Save Profile'}));
  await screen.findByText('Revision 2');
  fireEvent.click(screen.getByRole('button',{name:'Save Profile'}));
  await waitFor(() => expect(mocks.updateProfile).toHaveBeenLastCalledWith(expect.objectContaining({expectedVersion:2})));
  expect(screen.queryByRole('button',{name:'Activate SMS'})).not.toBeInTheDocument();
});
