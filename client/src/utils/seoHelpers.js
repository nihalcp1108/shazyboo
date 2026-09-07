// Central place for all SEO title/description templates.
// Falls back to dynamic generation unless a manual metaTitle/metaDescription
// is set on the product or category in the database.

const SITE_NAME = "Shazyboo";
const BASE_URL = "https://shazyboo.com";

export function getHomeMeta() {
  return {
    title: `${SITE_NAME} – Cute Stationery, Bags & Gifts Online India`,
    description: `Shop cute tote bags, kawaii stationery, plush toys & desk accessories at ${SITE_NAME}. Affordable, adorable finds for every mood — free shipping across India.`,
  };
}

export function getMainCategoryMeta(category) {
  if (category?.metaTitle && category?.metaDescription) {
    return { title: category.metaTitle, description: category.metaDescription };
  }
  const name = category?.name || "Products";
  return {
    title: `Cute ${name} Online India | ${SITE_NAME}`,
    description: `Shop cute ${name.toLowerCase()} at ${SITE_NAME}. Affordable, adorable finds delivered across India — shop online today.`,
  };
}

export function getCategoryMeta(category) {
  if (category?.metaTitle && category?.metaDescription) {
    return { title: category.metaTitle, description: category.metaDescription };
  }
  const name = category?.name || "Products";
  return {
    title: `Cute ${name} Online India | ${SITE_NAME}`,
    description: `Shop cute ${name.toLowerCase()} at ${SITE_NAME}. Affordable, adorable finds delivered across India — shop online today.`,
  };
}

export function getProductMeta(product) {
  if (product?.metaTitle && product?.metaDescription) {
    return { title: product.metaTitle, description: product.metaDescription };
  }
  const name = product?.name || "Product";
  const category = product?.category?.name || product?.category || "Products";
  const price = product?.price ? `₹${product.price}` : "";
  return {
    title: `${name} – Cute ${category} | ${SITE_NAME}`,
    description: `Shop ${name} at ${SITE_NAME} — adorable ${category.toLowerCase()}${price ? ` starting at ${price}` : ""}. Free shipping on cute stationery, bags & gifts across India.`,
  };
}

export function getCanonicalUrl(path) {
  return `${BASE_URL}${path}`;
}
