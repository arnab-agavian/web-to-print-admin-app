import React, { useEffect, useMemo } from 'react';
import { FileImage, X } from 'lucide-react';

export function customerDesignPreviewUrl(item) {
  return item?.configuration?.previewUrl
    || item?.configuration?.artworkPreviewUrl
    || item?.configuration?.artworkUrl
    || item?.configuration?.uploadUrl
    || item?.configuration?.designData?.previewUrl
    || item?.design?.previewUrl
    || item?.design?.previewPath
    || item?.previewUrl
    || '';
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function layerStyle(layer, canvasWidth, canvasHeight) {
  const bounds = layer.bounds ?? {};
  const textAlign = layer.style?.textAlign ?? 'center';
  return {
    left: `${(finiteNumber(bounds.x) / canvasWidth) * 100}%`,
    top: `${(finiteNumber(bounds.y) / canvasHeight) * 100}%`,
    width: `${(finiteNumber(bounds.width) / canvasWidth) * 100}%`,
    height: `${(finiteNumber(bounds.height) / canvasHeight) * 100}%`,
    color: layer.style?.color || '#17191d',
    fontFamily: layer.style?.fontFamily || 'Arial, sans-serif',
    fontSize: `clamp(8px, ${(finiteNumber(layer.style?.fontSize, 14) / canvasWidth) * 100}cqw, 240px)`,
    justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
    textAlign,
  };
}

function designCanvas(item) {
  const configuration = item?.configuration ?? {};
  const designData = configuration.designData ?? {};
  const layers = Array.isArray(designData.layers) ? designData.layers : [];
  const maximums = layers.reduce((result, layer) => ({
    width: Math.max(result.width, finiteNumber(layer.bounds?.x) + finiteNumber(layer.bounds?.width)),
    height: Math.max(result.height, finiteNumber(layer.bounds?.y) + finiteNumber(layer.bounds?.height)),
  }), { width: 0, height: 0 });
  const explicitWidth = finiteNumber(designData.canvasWidth ?? configuration.canvasWidth ?? configuration.templateCanvasWidth);
  const explicitHeight = finiteNumber(designData.canvasHeight ?? configuration.canvasHeight ?? configuration.templateCanvasHeight);
  return {
    layers,
    width: explicitWidth || Math.max(240, maximums.width),
    height: explicitHeight || Math.max(180, maximums.height),
  };
}

export default function CustomerDesignPreviewModal({ item, onClose }) {
  const canvas = useMemo(() => designCanvas(item), [item]);
  const previewUrl = customerDesignPreviewUrl(item);
  const configuration = item?.configuration ?? {};
  const productName = item?.product?.name || 'Customer design';
  const designName = item?.design?.name || configuration.designName || configuration.artworkName || 'Custom design';

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="design-preview-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="design-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="design-preview-title">
        <header>
          <div><p>CUSTOMER-SUBMITTED DESIGN</p><h2 id="design-preview-title">{designName}</h2><span>{productName} · {canvas.width} × {canvas.height} mm canvas</span></div>
          <button type="button" onClick={onClose} aria-label="Close design preview"><X /></button>
        </header>
        <div className="design-preview-stage">
          <div className="customer-design-canvas" style={{ aspectRatio: `${canvas.width} / ${canvas.height}` }}>
            {previewUrl ? <img className="customer-design-template" src={previewUrl} alt={`${designName} template`} /> : <div className="customer-design-empty"><FileImage /><span>Template preview unavailable</span></div>}
            {canvas.layers.map((layer, index) => (
              <div className={`customer-design-layer customer-design-layer-${layer.type || 'text'}`} style={layerStyle(layer, canvas.width, canvas.height)} key={layer.key || `${layer.type}-${index}`} title={layer.label || layer.key}>
                {layer.type === 'image'
                  ? layer.value ? <img src={layer.value} alt={layer.label || 'Customer uploaded image'} style={{ objectFit: layer.fit || 'contain' }} /> : <FileImage />
                  : <span>{layer.value ?? ''}</span>}
              </div>
            ))}
          </div>
        </div>
        <footer>
          <div><span>Material</span><b>{item?.material || 'Not specified'}</b></div>
          <div><span>Finished size</span><b>{finiteNumber(item?.widthMm) && finiteNumber(item?.heightMm) ? `${item.widthMm} × ${item.heightMm} mm` : 'Custom size'}</b></div>
          <div><span>Design method</span><b>{configuration.designMethod || 'Customer design'}</b></div>
          <div><span>Placeholders</span><b>{canvas.layers.length}</b></div>
        </footer>
      </section>
    </div>
  );
}
