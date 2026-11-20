import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import { CheckCircle2, FileImage, LoaderCircle, MessageSquareText, Upload } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  approveOrderProof,
  clearProofMutation,
  createOrderProof,
  fetchAdminAnalytics,
  requestOrderProofChanges,
} from '../../redux/slices/orderSlice';
import { AppTextField } from '../ui/AppFields';

const acceptedPreviewTypes = ['image/png', 'image/jpeg', 'image/webp'];
const maxPreviewSize = 10 * 1024 * 1024;

export default function ProofManager({ order }) {
  const dispatch = useDispatch();
  const { proofMutationStatus, proofMutationError, proofMutationOrderId } = useSelector((state) => state.orders);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState(order.changeRequestMessage || '');
  const [localError, setLocalError] = useState('');
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  const proofs = Array.isArray(order.proofs) ? order.proofs : [];
  const currentProof = order.currentProof ?? proofs[proofs.length - 1] ?? null;
  const proofPreview = currentProof?.previewPath || currentProof?.previewUrl || '';
  const loading = proofMutationStatus === 'loading' && proofMutationOrderId === order.id;
  const canCreate = ['artwork', 'changes_requested'].includes(order.status);
  const canReview = ['proof_ready', 'awaiting_approval'].includes(order.status);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => {
    dispatch(clearProofMutation());
  }, [dispatch, order.id]);

  const chooseFile = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) return;
    if (!acceptedPreviewTypes.includes(selected.type)) {
      setLocalError('Choose a PNG, JPEG, or WebP proof preview.');
      return;
    }
    if (selected.size > maxPreviewSize) {
      setLocalError('The proof preview must be 10 MB or smaller.');
      return;
    }
    setFile(selected);
    setLocalError('');
    dispatch(clearProofMutation());
  };

  const createProof = async (event) => {
    event.preventDefault();
    if (!file) {
      setLocalError('Choose a proof preview before creating the proof.');
      return;
    }
    const action = await dispatch(createOrderProof({ orderId: order.apiId || order.id, orderKey: order.id, file, notes }));
    if (createOrderProof.fulfilled.match(action)) {
      setFile(null);
      setNotes('');
      setLocalError('');
      dispatch(fetchAdminAnalytics());
    }
  };

  const approve = async () => {
    if (!currentProof?.id) return;
    const action = await dispatch(approveOrderProof({ orderKey: order.id, proofId: currentProof.id }));
    if (approveOrderProof.fulfilled.match(action)) dispatch(fetchAdminAnalytics());
  };

  const requestChanges = async () => {
    const trimmed = message.trim();
    if (!currentProof?.id || !trimmed) {
      setLocalError('Enter the requested changes before submitting.');
      return;
    }
    const action = await dispatch(requestOrderProofChanges({ orderKey: order.id, proofId: currentProof.id, message: trimmed }));
    if (requestOrderProofChanges.fulfilled.match(action)) dispatch(fetchAdminAnalytics());
  };

  if (!canCreate && !canReview) return null;

  return (
    <section className="proof-manager">
      <div className="proof-manager-head"><span><FileImage /></span><div><p>PROOF MANAGEMENT</p><h3>{canCreate ? `Create proof version ${order.proofVersion + 1}` : canReview ? `Review proof version ${order.proofVersion || currentProof?.version || 1}` : 'Proof approved'}</h3></div></div>
      {canCreate && (
        <form onSubmit={createProof}>
          {order.status === 'changes_requested' && <div className="proof-change-feedback"><b>Requested changes</b><p>{order.changeRequestMessage || currentProof?.changeRequestMessage || 'Review the requested changes and upload a revised proof.'}</p></div>}
          <div className="proof-upload-row">
            <div className="proof-preview">{previewUrl ? <img src={previewUrl} alt="Selected proof preview" /> : <FileImage />}</div>
            <div><Button component="label" variant="outlined" disabled={loading} startIcon={<Upload />}>Choose preview<input className="visually-hidden-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseFile} /></Button><small>{file?.name || 'PNG, JPEG, or WebP · max 10 MB'}</small></div>
          </div>
          <AppTextField label="Proof notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Please confirm the trim and colours." multiline minRows={2} disabled={loading} />
          <button className="primary-button proof-submit" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" />Uploading and creating…</> : <><Upload />Create proof</>}</button>
        </form>
      )}
      {canReview && (
        <div className="proof-review">
          {proofPreview ? <img src={proofPreview} alt={`Proof version ${order.proofVersion || 1}`} /> : <div className="proof-preview-missing"><FileImage /><span>Preview unavailable</span></div>}
          {currentProof?.notes && <p>{currentProof.notes}</p>}
          {currentProof?.id ? <><AppTextField label="Requested changes" value={message} onChange={(event) => { setMessage(event.target.value); setLocalError(''); }} placeholder="Please move the race number slightly higher." multiline minRows={2} disabled={loading} /><div className="proof-review-actions"><button type="button" onClick={requestChanges} disabled={loading}><MessageSquareText />Request changes</button><button type="button" className="approve" onClick={approve} disabled={loading}><CheckCircle2 />Approve proof</button></div></> : <div className="form-error">The current proof ID is missing. Refresh the orders and try again.</div>}
        </div>
      )}
      {(localError || proofMutationError) && <div className="form-error" role="alert">{localError || proofMutationError}</div>}
    </section>
  );
}
