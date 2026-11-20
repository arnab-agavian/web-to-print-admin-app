import axiosInstance from './axiosInstance';

function responseData(body) {
  return body?.response?.data ?? body?.data ?? body?.response ?? body;
}

function templatePayload(template) {
  return {
    name: template.name.trim(),
    canvasWidth: Number(template.canvasWidth),
    canvasHeight: Number(template.canvasHeight),
    safeArea: {
      x: Number(template.safeArea.x),
      y: Number(template.safeArea.y),
      width: Number(template.safeArea.width),
      height: Number(template.safeArea.height),
      unit: 'mm',
    },
    placeholderRules: template.placeholderRules,
    thumbnailPath: template.thumbnailPath || null,
    active: template.active !== false,
  };
}

export async function getProductTemplatesRequest(productSlug) {
  const { data } = await axiosInstance.get(`/products/${encodeURIComponent(productSlug)}/templates`);
  const templates = responseData(data);
  return Array.isArray(templates) ? templates : [];
}

export async function uploadTemplateThumbnailRequest(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', 'templates');
  const { data } = await axiosInstance.post('/files/upload', formData, {
    headers: { 'Content-Type': undefined },
  });
  return responseData(data);
}

export async function createTemplateRequest(productSlug, template) {
  const { data } = await axiosInstance.post(
    `/products/${encodeURIComponent(productSlug)}/templates`,
    templatePayload(template),
  );
  return responseData(data);
}

export async function updateTemplateRequest(templateId, template) {
  const { data } = await axiosInstance.patch(
    `/templates/${encodeURIComponent(templateId)}`,
    templatePayload(template),
  );
  return responseData(data);
}

export async function deleteTemplateRequest(templateId) {
  const { data } = await axiosInstance.delete(`/templates/${encodeURIComponent(templateId)}`);
  return responseData(data);
}
