import axiosInstance from './axiosInstance';

function responseData(body) {
  return body?.response?.data ?? body?.data ?? body?.response ?? body;
}

export async function getProductsRequest() {
  const { data } = await axiosInstance.get('/products');
  const products = responseData(data);
  return Array.isArray(products) ? products : [];
}

function productPayload(product) {
  const materials = (Array.isArray(product.materials) ? product.materials : String(product.materials || '').split(','))
    .map((material) => material.trim())
    .filter(Boolean);
  return {
    slug: product.slug.trim(),
    name: product.name.trim(),
    family: product.family,
    description: product.description.trim() || null,
    basePrice: Number(product.basePrice),
    minQuantity: Number(product.minQuantity),
    minWidth: Number(product.minWidth),
    maxWidth: Number(product.maxWidth),
    minHeight: Number(product.minHeight),
    maxHeight: Number(product.maxHeight),
    defaultWidth: Number(product.defaultWidth),
    defaultHeight: Number(product.defaultHeight),
    configurationSchema: {
      ...(product.configurationSchema || {}),
      materials,
    },
    active: product.active !== false,
  };
}

export async function createProductRequest(product) {
  const payload = productPayload(product);
  const { data } = await axiosInstance.post('/products', payload);
  return responseData(data);
}

export async function updateProductRequest(originalSlug, product) {
  const payload = productPayload(product);
  const { data } = await axiosInstance.put(`/products/${encodeURIComponent(originalSlug)}`, payload);
  return responseData(data);
}
