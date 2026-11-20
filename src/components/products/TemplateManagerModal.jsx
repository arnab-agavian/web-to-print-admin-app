import React, { useEffect, useRef, useState } from 'react';
import { AppBar, Box, Button, Checkbox, Dialog, DialogContent, FormControlLabel, IconButton, Toolbar, Typography } from '@mui/material';
import { AlertCircle, FileImage, ImagePlus, LoaderCircle, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearTemplateMutation,
  createTemplate,
  deleteTemplate,
  fetchTemplates,
  resetTemplates,
  updateTemplate,
} from '../../redux/slices/templateSlice';
import { AppSelectField, AppTextField } from '../ui/AppFields';

const imageTypes = ['image/png', 'image/jpeg', 'image/webp'];
const maxThumbnailSize = 10 * 1024 * 1024;
const placeholderDefinitions = {
  raceNumber: {
    type: 'text',
    label: 'Race number',
    required: true,
    bounds: { x: 25, y: 35, width: 190, height: 95, unit: 'mm' },
    validation: { pattern: '^[0-9]{1,3}$', maxLength: 3 },
    style: { fontFamily: 'Arial Black', fontSize: 72, textAlign: 'center', color: '#000000' },
  },
  riderName: {
    type: 'text',
    label: 'Rider name',
    required: false,
    bounds: { x: 30, y: 140, width: 180, height: 20, unit: 'mm' },
    validation: { maxLength: 30 },
    style: { fontFamily: 'Arial', fontSize: 16, textAlign: 'center', color: '#000000' },
  },
  sponsorLogo: {
    type: 'image',
    label: 'Sponsor logo',
    required: false,
    bounds: { x: 170, y: 10, width: 50, height: 20, unit: 'mm' },
    validation: {
      acceptedTypes: ['image/png', 'image/jpeg', 'image/webp'],
      maxSizeBytes: 5242880,
    },
    fit: 'contain',
  },
};

function mergePlaceholderDefinitions(rules) {
  const stored = rules?.placeholders ?? rules ?? {};
  return Object.fromEntries(Object.entries(placeholderDefinitions).map(([key, definition]) => {
    const saved = stored[key] ?? {};
    return [key, {
      ...definition,
      ...saved,
      bounds: { ...definition.bounds, ...(saved.bounds ?? {}) },
      validation: { ...definition.validation, ...(saved.validation ?? {}) },
      ...(definition.style || saved.style ? { style: { ...(definition.style ?? {}), ...(saved.style ?? {}) } } : {}),
    }];
  }));
}

function normalizePlaceholder(placeholder) {
  const normalized = {
    ...placeholder,
    bounds: {
      ...placeholder.bounds,
      x: Number(placeholder.bounds.x),
      y: Number(placeholder.bounds.y),
      width: Number(placeholder.bounds.width),
      height: Number(placeholder.bounds.height),
      unit: 'mm',
    },
  };
  if (placeholder.validation) {
    normalized.validation = {
      ...placeholder.validation,
      ...(placeholder.validation.maxLength != null ? { maxLength: Number(placeholder.validation.maxLength) } : {}),
      ...(placeholder.validation.maxSizeBytes != null ? { maxSizeBytes: Number(placeholder.validation.maxSizeBytes) } : {}),
    };
  }
  if (placeholder.style) normalized.style = { ...placeholder.style, fontSize: Number(placeholder.style.fontSize) };
  return normalized;
}

function thumbnailUrl(template) {
  return template.thumbnail || template.thumbnailUrl || template.thumbnailSignedUrl || template.signedUrl || '';
}

function initialTemplate(product, template) {
  const canvasWidth = template?.canvasWidth ?? 240;
  const canvasHeight = template?.canvasHeight ?? 180;
  return {
    name: template?.name ?? '',
    canvasWidth,
    canvasHeight,
    safeArea: template?.safeArea ?? {
      x: 10,
      y: 10,
      width: 220,
      height: 160,
      unit: 'mm',
    },
    placeholderRules: template?.placeholderRules ?? {},
    thumbnailPath: template?.thumbnailPath ?? null,
    thumbnail: thumbnailUrl(template || {}),
    active: template?.active !== false,
  };
}

function TemplateForm({ product, template, status, apiError, clearError, onCancel, onSave }) {
  const [form, setForm] = useState(() => initialTemplate(product, template));
  const [placeholders, setPlaceholders] = useState(() => mergePlaceholderDefinitions(form.placeholderRules));
  const [selectedPlaceholders, setSelectedPlaceholders] = useState(() => {
    const stored = form.placeholderRules?.placeholders ?? form.placeholderRules ?? {};
    const selected = Object.keys(stored).filter((key) => placeholderDefinitions[key]);
    return template ? selected : Object.keys(placeholderDefinitions);
  });
  const [activePlaceholder, setActivePlaceholder] = useState(() => {
    const stored = form.placeholderRules?.placeholders ?? form.placeholderRules ?? {};
    return Object.keys(stored).find((key) => placeholderDefinitions[key]) ?? 'raceNumber';
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(() => thumbnailUrl(template || {}));
  const [localError, setLocalError] = useState('');
  const previewRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const safeAreaDragRef = useRef(null);
  const safeAreaResizeRef = useRef(null);
  const loading = status === 'loading';

  useEffect(() => {
    if (!thumbnailFile) return undefined;
    const objectUrl = URL.createObjectURL(thumbnailFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [thumbnailFile]);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setLocalError('');
    if (apiError) clearError();
  };
  const updateSafeArea = (key) => (event) => {
    setForm((current) => ({ ...current, safeArea: { ...current.safeArea, [key]: event.target.value } }));
    setLocalError('');
    if (apiError) clearError();
  };
  const togglePlaceholder = (key) => {
    const selected = selectedPlaceholders.includes(key);
    const next = selected
      ? selectedPlaceholders.filter((item) => item !== key)
      : [...selectedPlaceholders, key];
    setSelectedPlaceholders(next);
    if (selected) {
      if (activePlaceholder === key) setActivePlaceholder(next[0] ?? null);
    } else {
      setActivePlaceholder(key);
    }
    setLocalError('');
    if (apiError) clearError();
  };
  const selectPlaceholderForEditing = (key) => {
    if (!selectedPlaceholders.includes(key)) togglePlaceholder(key);
    else setActivePlaceholder(key);
  };
  const updatePlaceholder = (key, changes) => {
    setPlaceholders((current) => ({ ...current, [key]: { ...current[key], ...changes } }));
    setLocalError('');
    if (apiError) clearError();
  };
  const updatePlaceholderSection = (key, section, field, value) => {
    setPlaceholders((current) => ({
      ...current,
      [key]: { ...current[key], [section]: { ...current[key][section], [field]: value } },
    }));
    setLocalError('');
    if (apiError) clearError();
  };
  const startSafeAreaDrag = (event) => {
    if (loading) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    safeAreaDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      bounds: { ...form.safeArea },
    };
    setLocalError('');
    if (apiError) clearError();
  };
  const dragSafeArea = (event) => {
    const drag = safeAreaDragRef.current;
    const preview = previewRef.current;
    if (!drag || !preview) return;
    const rect = preview.getBoundingClientRect();
    const width = Number(drag.bounds.width);
    const height = Number(drag.bounds.height);
    const x = Math.min(Math.max(Number(drag.bounds.x) + ((event.clientX - drag.startX) / rect.width) * canvasWidth, 0), Math.max(canvasWidth - width, 0));
    const y = Math.min(Math.max(Number(drag.bounds.y) + ((event.clientY - drag.startY) / rect.height) * canvasHeight, 0), Math.max(canvasHeight - height, 0));
    setForm((current) => ({ ...current, safeArea: { ...current.safeArea, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) } }));
  };
  const stopSafeAreaDrag = () => { safeAreaDragRef.current = null; };
  const startSafeAreaResize = (event) => {
    if (loading) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    safeAreaResizeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      bounds: { ...form.safeArea },
    };
    setLocalError('');
    if (apiError) clearError();
  };
  const resizeSafeArea = (event) => {
    const resize = safeAreaResizeRef.current;
    const preview = previewRef.current;
    if (!resize || !preview) return;
    event.stopPropagation();
    const rect = preview.getBoundingClientRect();
    const availableWidth = Math.max(canvasWidth - Number(resize.bounds.x), 5);
    const availableHeight = Math.max(canvasHeight - Number(resize.bounds.y), 5);
    const width = Math.min(Math.max(Number(resize.bounds.width) + ((event.clientX - resize.startX) / rect.width) * canvasWidth, 5), availableWidth);
    const height = Math.min(Math.max(Number(resize.bounds.height) + ((event.clientY - resize.startY) / rect.height) * canvasHeight, 5), availableHeight);
    setForm((current) => ({ ...current, safeArea: { ...current.safeArea, width: Number(width.toFixed(1)), height: Number(height.toFixed(1)) } }));
  };
  const stopSafeAreaResize = (event) => {
    event.stopPropagation();
    safeAreaResizeRef.current = null;
  };
  const startDrag = (key, event) => {
    if (loading) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setActivePlaceholder(key);
    dragRef.current = {
      key,
      startX: event.clientX,
      startY: event.clientY,
      bounds: { ...placeholders[key].bounds },
    };
  };
  const dragPlaceholder = (event) => {
    const drag = dragRef.current;
    const preview = previewRef.current;
    if (!drag || !preview) return;
    const rect = preview.getBoundingClientRect();
    const canvasWidth = Number(form.canvasWidth) || 1;
    const canvasHeight = Number(form.canvasHeight) || 1;
    const width = Number(drag.bounds.width);
    const height = Number(drag.bounds.height);
    const x = Math.min(Math.max(Number(drag.bounds.x) + ((event.clientX - drag.startX) / rect.width) * canvasWidth, 0), Math.max(canvasWidth - width, 0));
    const y = Math.min(Math.max(Number(drag.bounds.y) + ((event.clientY - drag.startY) / rect.height) * canvasHeight, 0), Math.max(canvasHeight - height, 0));
    updatePlaceholderSection(drag.key, 'bounds', 'x', Number(x.toFixed(1)));
    updatePlaceholderSection(drag.key, 'bounds', 'y', Number(y.toFixed(1)));
  };
  const stopDrag = () => { dragRef.current = null; };
  const startResize = (key, event) => {
    if (loading) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setActivePlaceholder(key);
    resizeRef.current = {
      key,
      startX: event.clientX,
      startY: event.clientY,
      bounds: { ...placeholders[key].bounds },
    };
  };
  const resizePlaceholder = (event) => {
    const resize = resizeRef.current;
    const preview = previewRef.current;
    if (!resize || !preview) return;
    event.stopPropagation();
    const rect = preview.getBoundingClientRect();
    const canvasWidth = Number(form.canvasWidth) || 1;
    const canvasHeight = Number(form.canvasHeight) || 1;
    const availableWidth = Math.max(canvasWidth - Number(resize.bounds.x), 5);
    const availableHeight = Math.max(canvasHeight - Number(resize.bounds.y), 5);
    const width = Math.min(Math.max(Number(resize.bounds.width) + ((event.clientX - resize.startX) / rect.width) * canvasWidth, 5), availableWidth);
    const height = Math.min(Math.max(Number(resize.bounds.height) + ((event.clientY - resize.startY) / rect.height) * canvasHeight, 5), availableHeight);
    updatePlaceholderSection(resize.key, 'bounds', 'width', Number(width.toFixed(1)));
    updatePlaceholderSection(resize.key, 'bounds', 'height', Number(height.toFixed(1)));
  };
  const stopResize = (event) => {
    event.stopPropagation();
    resizeRef.current = null;
  };
  const chooseThumbnail = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!imageTypes.includes(file.type)) {
      setLocalError('Choose a PNG, JPEG, or WebP thumbnail.');
      event.target.value = '';
      return;
    }
    if (file.size > maxThumbnailSize) {
      setLocalError('The thumbnail must be 10 MB or smaller.');
      event.target.value = '';
      return;
    }
    setThumbnailFile(file);
    setLocalError('');
    if (apiError) clearError();
  };
  const removeThumbnail = () => {
    setThumbnailFile(null);
    setPreviewUrl('');
    setForm((current) => ({ ...current, thumbnailPath: null, thumbnail: '' }));
    if (apiError) clearError();
  };
  const submit = (event) => {
    event.preventDefault();
    if (!selectedPlaceholders.length) {
      setLocalError('Select at least one placeholder.');
      return;
    }
    const placeholderRules = {
      version: 1,
      placeholders: Object.fromEntries(
        selectedPlaceholders.map((key) => [key, normalizePlaceholder(placeholders[key])]),
      ),
    };
    const canvasWidth = Number(form.canvasWidth);
    const canvasHeight = Number(form.canvasHeight);
    const safeArea = {
      x: Number(form.safeArea.x),
      y: Number(form.safeArea.y),
      width: Number(form.safeArea.width),
      height: Number(form.safeArea.height),
      unit: 'mm',
    };
    if (safeArea.x + safeArea.width > canvasWidth || safeArea.y + safeArea.height > canvasHeight) {
      setLocalError('The safe area must fit inside the canvas.');
      return;
    }
    const outsideCanvas = selectedPlaceholders.find((key) => {
      const { bounds } = normalizePlaceholder(placeholders[key]);
      return bounds.x < 0 || bounds.y < 0 || bounds.x + bounds.width > canvasWidth || bounds.y + bounds.height > canvasHeight;
    });
    if (outsideCanvas) {
      setLocalError(`${placeholders[outsideCanvas].label} must fit inside the canvas.`);
      return;
    }
    onSave({ ...form, canvasWidth, canvasHeight, safeArea, placeholderRules }, thumbnailFile);
  };
  const error = localError || apiError;
  const activeDefinition = activePlaceholder ? placeholders[activePlaceholder] : null;
  const canvasWidth = Number(form.canvasWidth) || 1;
  const canvasHeight = Number(form.canvasHeight) || 1;
  const safeAreaStyle = {
    left: `${(Number(form.safeArea.x) / canvasWidth) * 100}%`,
    top: `${(Number(form.safeArea.y) / canvasHeight) * 100}%`,
    width: `${(Number(form.safeArea.width) / canvasWidth) * 100}%`,
    height: `${(Number(form.safeArea.height) / canvasHeight) * 100}%`,
  };

  return (
    <form className="template-form" onSubmit={submit}>
      <div className="template-form-head">
        <div><p>{template ? 'EDIT TEMPLATE' : 'NEW TEMPLATE'}</p><h3>{template ? template.name : `Template for ${product.name}`}</h3></div>
        <button type="button" onClick={onCancel} disabled={loading}><X /></button>
      </div>
      <div className="template-editor-layout">
        <div className="template-editor-fields">
          <AppTextField label="Template name" required slotProps={{ htmlInput: { minLength: 2, maxLength: 200 } }} value={form.name} onChange={update('name')} disabled={loading} placeholder="e.g. Race board 240 × 180" />
          <div className="form-row">
            <AppTextField label="Canvas width (mm)" required type="number" slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} value={form.canvasWidth} onChange={update('canvasWidth')} disabled={loading} />
            <AppTextField label="Canvas height (mm)" required type="number" slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} value={form.canvasHeight} onChange={update('canvasHeight')} disabled={loading} />
          </div>
          <p className="modal-section-label">SAFE AREA (MM)</p>
          <div className="template-safe-grid">
            <AppTextField label="X" required type="number" slotProps={{ htmlInput: { min: 0, step: 0.01 } }} value={form.safeArea.x} onChange={updateSafeArea('x')} disabled={loading} />
            <AppTextField label="Y" required type="number" slotProps={{ htmlInput: { min: 0, step: 0.01 } }} value={form.safeArea.y} onChange={updateSafeArea('y')} disabled={loading} />
            <AppTextField label="Width" required type="number" slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} value={form.safeArea.width} onChange={updateSafeArea('width')} disabled={loading} />
            <AppTextField label="Height" required type="number" slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} value={form.safeArea.height} onChange={updateSafeArea('height')} disabled={loading} />
          </div>
          <div className="placeholder-field">
            <span>Placeholders</span>
            <div className="placeholder-options">
              {Object.entries(placeholderDefinitions).map(([key, definition]) => {
                const selected = selectedPlaceholders.includes(key);
                const active = activePlaceholder === key;
                return <div className={`placeholder-option ${selected ? 'selected' : ''} ${active ? 'active' : ''}`} key={key}><Checkbox size="small" checked={selected} onChange={() => togglePlaceholder(key)} disabled={loading} inputProps={{ 'aria-label': `Include ${definition.label}` }} /><button type="button" onClick={() => selectPlaceholderForEditing(key)} disabled={loading}><b>{placeholders[key].label}</b><small>{definition.type === 'image' ? 'Image upload' : placeholders[key].required ? 'Required text' : 'Optional text'}</small></button></div>;
              })}
            </div>
            <small>Use the checkbox to include a field. Click its name to edit it.</small>
          </div>
          {activeDefinition && selectedPlaceholders.includes(activePlaceholder) && (
            <div className="placeholder-inspector">
              <div className="placeholder-inspector-head"><span>EDIT PLACEHOLDER</span><b>{activeDefinition.label}</b></div>
              <div className="form-row">
                <AppTextField label="Label" value={activeDefinition.label} onChange={(event) => updatePlaceholder(activePlaceholder, { label: event.target.value })} disabled={loading} />
                <AppTextField label="Type" value={activeDefinition.type} disabled />
              </div>
              <FormControlLabel className="placeholder-required" control={<Checkbox checked={activeDefinition.required} onChange={(event) => updatePlaceholder(activePlaceholder, { required: event.target.checked })} disabled={loading} />} label="Required field" />
              <p className="modal-section-label">POSITION & SIZE (MM)</p>
              <div className="template-safe-grid">
                <AppTextField label="X" type="number" slotProps={{ htmlInput: { min: 0, step: 0.1 } }} value={activeDefinition.bounds.x} onChange={(event) => updatePlaceholderSection(activePlaceholder, 'bounds', 'x', event.target.value)} disabled={loading} />
                <AppTextField label="Y" type="number" slotProps={{ htmlInput: { min: 0, step: 0.1 } }} value={activeDefinition.bounds.y} onChange={(event) => updatePlaceholderSection(activePlaceholder, 'bounds', 'y', event.target.value)} disabled={loading} />
                <AppTextField label="Width" type="number" slotProps={{ htmlInput: { min: 0.1, step: 0.1 } }} value={activeDefinition.bounds.width} onChange={(event) => updatePlaceholderSection(activePlaceholder, 'bounds', 'width', event.target.value)} disabled={loading} />
                <AppTextField label="Height" type="number" slotProps={{ htmlInput: { min: 0.1, step: 0.1 } }} value={activeDefinition.bounds.height} onChange={(event) => updatePlaceholderSection(activePlaceholder, 'bounds', 'height', event.target.value)} disabled={loading} />
              </div>
              {activeDefinition.type === 'text' ? (
                <>
                  <p className="modal-section-label">TEXT STYLE</p>
                  <div className="form-row">
                    <AppTextField label="Font family" value={activeDefinition.style.fontFamily} onChange={(event) => updatePlaceholderSection(activePlaceholder, 'style', 'fontFamily', event.target.value)} disabled={loading} />
                    <AppTextField label="Font size" type="number" slotProps={{ htmlInput: { min: 1 } }} value={activeDefinition.style.fontSize} onChange={(event) => updatePlaceholderSection(activePlaceholder, 'style', 'fontSize', event.target.value)} disabled={loading} />
                  </div>
                  <div className="form-row">
                    <AppSelectField label="Alignment" value={activeDefinition.style.textAlign} onChange={(event) => updatePlaceholderSection(activePlaceholder, 'style', 'textAlign', event.target.value)} disabled={loading} options={['left', 'center', 'right']} />
                    <AppTextField label="Colour" className="placeholder-colour" type="color" value={activeDefinition.style.color} onChange={(event) => updatePlaceholderSection(activePlaceholder, 'style', 'color', event.target.value)} disabled={loading} />
                  </div>
                  <div className="form-row">
                    <AppTextField label="Maximum length" type="number" slotProps={{ htmlInput: { min: 1 } }} value={activeDefinition.validation.maxLength ?? ''} onChange={(event) => updatePlaceholderSection(activePlaceholder, 'validation', 'maxLength', event.target.value)} disabled={loading} />
                    <AppTextField label="Pattern" value={activeDefinition.validation.pattern ?? ''} onChange={(event) => updatePlaceholderSection(activePlaceholder, 'validation', 'pattern', event.target.value)} disabled={loading} placeholder="Optional regex" />
                  </div>
                </>
              ) : (
                <><p className="modal-section-label">IMAGE STYLE</p><AppSelectField label="Image fit" value={activeDefinition.fit} onChange={(event) => updatePlaceholder(activePlaceholder, { fit: event.target.value })} disabled={loading} options={['contain', 'cover', 'fill']} /></>
              )}
            </div>
          )}
          <div className="thumbnail-field">
            <span>Thumbnail</span>
            <div className="thumbnail-picker">
              {previewUrl ? <img src={previewUrl} alt="Template thumbnail preview" /> : <div><ImagePlus /><small>No thumbnail selected</small></div>}
              <div><Button component="label" variant="outlined" className="thumbnail-button" disabled={loading}>Choose image<input className="visually-hidden-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseThumbnail} /></Button><small>PNG, JPEG, or WebP · max 10 MB</small>{(previewUrl || form.thumbnailPath) && <button type="button" onClick={removeThumbnail} disabled={loading}>Remove thumbnail</button>}</div>
            </div>
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <footer><button type="button" className="secondary-button" onClick={onCancel} disabled={loading}>Cancel</button><button className="primary-button" type="submit" disabled={loading} aria-busy={loading}>{loading ? 'Saving template…' : template ? 'Save template' : 'Create template'}</button></footer>
        </div>
        <aside className="template-preview-panel">
          <div className="template-preview-head"><div><b>Canvas preview</b><small>{canvasWidth} × {canvasHeight} mm</small></div><span>Drag to move · corner to resize</span></div>
          <div className="template-canvas-wrap">
            <div className="template-canvas" ref={previewRef} style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}>
              <div className={`template-safe-area ${previewUrl ? 'has-thumbnail' : ''}`} style={safeAreaStyle} onPointerDown={startSafeAreaDrag} onPointerMove={dragSafeArea} onPointerUp={stopSafeAreaDrag} onPointerCancel={stopSafeAreaDrag} title="Drag to move the safe area">
                {previewUrl && <img src={previewUrl} alt="" aria-hidden="true" />}
                <span>SAFE AREA</span>
                <i className="safe-area-resize-handle" onPointerDown={startSafeAreaResize} onPointerMove={resizeSafeArea} onPointerUp={stopSafeAreaResize} onPointerCancel={stopSafeAreaResize} title="Resize the safe area" />
              </div>
              {selectedPlaceholders.map((key) => {
                const placeholder = placeholders[key];
                const { bounds } = placeholder;
                const justifyContent = placeholder.style?.textAlign === 'left' ? 'flex-start' : placeholder.style?.textAlign === 'right' ? 'flex-end' : 'center';
                return <button type="button" key={key} className={`canvas-placeholder canvas-placeholder-${placeholder.type} ${activePlaceholder === key ? 'active' : ''}`} style={{ left: `${(Number(bounds.x) / canvasWidth) * 100}%`, top: `${(Number(bounds.y) / canvasHeight) * 100}%`, width: `${(Number(bounds.width) / canvasWidth) * 100}%`, height: `${(Number(bounds.height) / canvasHeight) * 100}%`, color: placeholder.style?.color, fontFamily: placeholder.style?.fontFamily, fontSize: `${Math.max(9, Math.min(Number(placeholder.style?.fontSize ?? 14) * .45, 42))}px`, justifyContent }} onPointerDown={(event) => startDrag(key, event)} onPointerMove={dragPlaceholder} onPointerUp={stopDrag} onPointerCancel={stopDrag} title={`Drag ${placeholder.label}`}>
                  {placeholder.type === 'image' ? <><FileImage /><span>{placeholder.label}</span></> : key === 'raceNumber' ? '123' : placeholder.label}
                  <i className="canvas-resize-handle" onPointerDown={(event) => startResize(key, event)} onPointerMove={resizePlaceholder} onPointerUp={stopResize} onPointerCancel={stopResize} title={`Resize ${placeholder.label}`} />
                </button>;
              })}
            </div>
          </div>
          {activeDefinition && <div className="template-preview-meta"><b>{activeDefinition.label}</b><span>X {activeDefinition.bounds.x} · Y {activeDefinition.bounds.y} · {activeDefinition.bounds.width} × {activeDefinition.bounds.height} mm</span></div>}
        </aside>
      </div>
    </form>
  );
}

export default function TemplateManagerModal({ product, onClose }) {
  const dispatch = useDispatch();
  const { items, fetchStatus, mutationStatus, deletingId, fetchError, mutationError } = useSelector((state) => state.templates);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    dispatch(fetchTemplates(product.slug));
  }, [dispatch, product.slug]);

  const close = () => {
    if (mutationStatus === 'loading' || deletingId) return;
    dispatch(resetTemplates());
    onClose();
  };
  const openCreate = () => { dispatch(clearTemplateMutation()); setEditingTemplate(null); setFormOpen(true); };
  const openEdit = (template) => { dispatch(clearTemplateMutation()); setEditingTemplate(template); setFormOpen(true); };
  const cancelForm = () => { if (mutationStatus !== 'loading') { dispatch(clearTemplateMutation()); setFormOpen(false); setEditingTemplate(null); } };
  const save = async (template, thumbnailFile) => {
    try {
      if (editingTemplate) {
        await dispatch(updateTemplate({ templateId: editingTemplate.id, template, thumbnailFile })).unwrap();
      } else {
        await dispatch(createTemplate({ productSlug: product.slug, template, thumbnailFile })).unwrap();
      }
      setFormOpen(false);
      setEditingTemplate(null);
    } catch {
      // The form renders the Redux mutation error.
    }
  };
  const remove = async (template) => {
    if (!window.confirm(`Delete “${template.name}”? This cannot be undone.`)) return;
    await dispatch(deleteTemplate(template.id));
  };

  let body;
  if (formOpen) {
    body = <TemplateForm product={product} template={editingTemplate} status={mutationStatus} apiError={mutationError} clearError={() => dispatch(clearTemplateMutation())} onCancel={cancelForm} onSave={save} />;
  } else if (fetchStatus === 'loading') {
    body = <div className="template-state" role="status"><LoaderCircle className="spin" /><b>Loading templates</b></div>;
  } else if (fetchError) {
    body = <div className="template-state" role="alert"><AlertCircle /><b>Could not load templates</b><span>{fetchError}</span><button className="secondary-button" onClick={() => dispatch(fetchTemplates(product.slug))}><RefreshCw />Try again</button></div>;
  } else if (!items.length) {
    body = <div className="template-state"><FileImage /><b>No templates yet</b><span>Create the first canvas template for this product.</span><button className="primary-button" onClick={openCreate}><Plus />Create template</button></div>;
  } else {
    body = <div className="template-list">{items.map((template) => { const preview = thumbnailUrl(template); return <article className="template-card" key={template.id}>{preview ? <img src={preview} alt="" /> : <div className="template-thumb-empty"><FileImage /></div>}<div className="template-card-copy"><b>{template.name}</b><span>{template.canvasWidth} × {template.canvasHeight} mm</span>{template.thumbnailPath && <small title={template.thumbnailPath}>{template.thumbnailPath.split('/').pop()}</small>}</div><div className="template-card-actions"><button onClick={() => openEdit(template)} aria-label={`Edit ${template.name}`}><Pencil /></button><button className="danger" onClick={() => remove(template)} disabled={deletingId === template.id} aria-label={`Delete ${template.name}`}>{deletingId === template.id ? <LoaderCircle className="spin" /> : <Trash2 />}</button></div></article>; })}{mutationError && <div className="form-error" role="alert">{mutationError}</div>}</div>;
  }

  return <Dialog fullScreen open onClose={close} aria-labelledby="template-modal-title"><AppBar position="sticky" elevation={0} className="template-dialog-appbar"><Toolbar className="template-dialog-toolbar"><Box className="template-dialog-heading"><Typography component="p">PRODUCT TEMPLATES</Typography><Typography component="h2" id="template-modal-title">{product.name}</Typography></Box><IconButton edge="end" color="inherit" onClick={close} disabled={mutationStatus === 'loading' || Boolean(deletingId)} aria-label="Close templates"><X /></IconButton></Toolbar></AppBar><DialogContent className="template-dialog-content"><div className="template-dialog-inner">{!formOpen && fetchStatus === 'succeeded' && items.length > 0 && <div className="template-toolbar"><span>{items.length} active {items.length === 1 ? 'template' : 'templates'}</span><Button variant="contained" onClick={openCreate} startIcon={<Plus />} className="template-dialog-add">Add template</Button></div>}{body}</div></DialogContent></Dialog>;
}
