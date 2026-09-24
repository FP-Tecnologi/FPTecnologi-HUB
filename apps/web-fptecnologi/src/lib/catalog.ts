/*
 * Catálogo de la tienda -- snapshot real de fptecnologi.com (API pública de
 * WooCommerce, /wp-json/wc/store/v1/products) tomado el 2026-09-24: 23
 * productos en stock de las 4 categorías de la home. Precios en USD sin IGV.
 * Las fotos se sirven desde fptecnologi.com. Cuando la tienda se conecte a
 * la API propia (ver docs/plan-trabajo.md), este archivo se reemplaza por
 * esa consulta. Algunos nombres/fotos vienen así desde el sitio de origen.
 */

/** Producto como lo usan tarjeta, comparador, carrito y favoritos. */
export type ShopProduct = {
  sku: string;
  name: string;
  brand: string;
  price: number;
  priceBefore?: number | null;
  images: readonly string[];
};

export type CatalogProduct = ShopProduct & { category: string };

const FP = 'https://fptecnologi.com/wp-content/uploads';

export const CATALOG: CatalogProduct[] = [
  // Monitores
  { sku: '63A4MAR1', name: 'Monitor Lenovo ThinkVision T27i-30 27"', brand: 'Lenovo', category: 'monitores', price: 270, priceBefore: 295, images: [`${FP}/2025/06/63A4MAR1.png`, `${FP}/2025/06/63CFMAR1LA-2.png`] },
  { sku: '63CFMAR1LA', name: 'Monitor Lenovo ThinkVision T24i-30, 23.8″ WLED IPS, HDMI, DisplayPort, VGA', brand: 'Lenovo', category: 'monitores', price: 220, priceBefore: 229, images: [`${FP}/2025/06/63CFMAR1LA.png`, `${FP}/2025/06/63CFMAR1LA-2.png`] },
  { sku: 'P2724DEB', name: 'Monitor Dell P2724DEB 27″ LCD IPS QHD USB-C', brand: 'Dell', category: 'monitores', price: 591, priceBefore: 630, images: [`${FP}/2025/06/P2724DEB.png`] },
  { sku: '90LM0559-B011B0', name: 'Monitor ASUS Eye Care VA27EQSB 27" FHD IPS, HDMI, VGA, DP', brand: 'ASUS', category: 'monitores', price: 202, priceBefore: 215, images: [`${FP}/2025/06/90LM04P1-B023B0.png`] },
  { sku: '90LM04P1-B023B0', name: 'Monitor ASUS BE279QSK 27″ FHD IPS con webcam, HDMI, VGA, DP', brand: 'ASUS', category: 'monitores', price: 289, priceBefore: 310, images: [`${FP}/2025/06/90LM04P1-B023B0.png`] },
  { sku: '6N4E2AA#ABA', name: 'Monitor HP E27 G5, 27″ FHD IPS, HDMI, DP, USB-A x4', brand: 'HP', category: 'monitores', price: 240, priceBefore: 265, images: [`${FP}/2025/06/6N4E2AAABA.png`, `${FP}/2025/06/6N4E2AAABA-1.png`, `${FP}/2025/06/6N4E2AAABA-2.png`] },
  { sku: '169L0AA#ABA', name: 'Monitor HP E24mv G4, 23.8″ FHD IPS para videoconferencia', brand: 'HP', category: 'monitores', price: 272, priceBefore: 290, images: [`${FP}/2023/09/Mesa-de-trabajo-4.webp`, `${FP}/2023/09/monhp169l0aaaba_1.jpg`] },
  // Laptops
  { sku: 'YTG8G', name: 'Laptop Dell Latitude 3550 15.6″ FHD, Core i5-1335U, 8GB, 512GB SSD', brand: 'Dell', category: 'laptops', price: 806, priceBefore: 1100, images: [`${FP}/2025/06/YTG8G.png`, `${FP}/2025/06/YTG8G-3.png`, `${FP}/2025/06/YTG8G-2.png`] },
  { sku: 'DRJ78', name: 'Laptop Dell Latitude 5550, Core Ultra 7 155U, 16GB, 512GB SSD, 15.6″ FHD, Windows 11', brand: 'Dell', category: 'laptops', price: 1362, priceBefore: 1450, images: [`${FP}/2025/06/DRJ78.png`, `${FP}/2025/06/DRJ78-3.png`, `${FP}/2025/06/DRJ78-2.png`] },
  { sku: 'A27NWLA#ABM', name: 'Laptop HP ProBook 460 16″ FHD, Core Ultra 5 125U, 16GB DDR5', brand: 'HP', category: 'laptops', price: 1056, priceBefore: 1200, images: [`${FP}/2025/06/A24Z6LTABM.png`, `${FP}/2025/06/A24Z6LTABM-3.png`, `${FP}/2025/06/A24Z6LTABM-2.png`] },
  { sku: 'A24Z6LT#ABM', name: 'Laptop HP ProBook 460 G11 16″ WUXGA, Core Ultra 7 155U, 16GB DDR5', brand: 'HP', category: 'laptops', price: 1230, priceBefore: 1300, images: [`${FP}/2025/06/A24Z6LTABM.png`, `${FP}/2025/06/A24Z6LTABM-3.png`, `${FP}/2025/06/A24Z6LTABM-2.png`] },
  // Pantallas interactivas
  { sku: '98TR3DK-B', name: 'Pizarra digital interactiva LG 98TR3DK-BM, 98″ UHD IPS, multi-touch', brand: 'LG', category: 'pantallas', price: 6175, priceBefore: 6300, images: [`${FP}/2022/05/75TR3DK-BM.png`, `${FP}/2022/05/large02.webp`, `${FP}/2022/05/large03.webp`] },
  { sku: '86TR3DK-BY', name: 'Pizarra digital interactiva LG TR3DK 86″ UHD IPS, multi-touch', brand: 'LG', category: 'pantallas', price: 2323, priceBefore: 2500, images: [`${FP}/2022/05/75TR3DK-BM.png`, `${FP}/2022/05/large02.webp`, `${FP}/2022/05/large03.webp`] },
  { sku: '75TR3DK-BM', name: 'Pizarra digital interactiva LG 75TR3DK, 75″ UHD IPS, multi-touch', brand: 'LG', category: 'pantallas', price: 1953, priceBefore: null, images: [`${FP}/2022/05/75TR3DK-BM.png`, `${FP}/2022/05/large02.webp`, `${FP}/2022/05/large03.webp`] },
  // Servidores
  { sku: 'P75344-DM5', name: 'Servidor HP ProLiant DL380 G11, Xeon Silver 4410Y, 32GB DDR5, 4TB, Rack 2U', brand: 'HP', category: 'servidores', price: 6644, priceBefore: 6800, images: [`${FP}/2025/06/P75344-DM5.png`] },
  { sku: 'P55242-B21', name: 'Servidor HPE ProLiant DL360 G10 Plus, Xeon 4314 2.40GHz, 32GB', brand: 'HP', category: 'servidores', price: 4968, priceBefore: 5200, images: [`${FP}/2025/06/P55242-B21.png`] },
  { sku: 'P78114-DM5', name: 'Servidor HPE ProLiant ML110 Gen11, 3408U 8 núcleos, 32GB, 2x HDD 4TB', brand: 'HP', category: 'servidores', price: 2998, priceBefore: 3200, images: [`${FP}/2025/06/P78114-DM5.png`] },
  { sku: '7DF4A019LA', name: 'Servidor Lenovo ThinkSystem ST50 V3, Intel E-2414, 16GB, 2TB', brand: 'Lenovo', category: 'servidores', price: 1952, priceBefore: 2300, images: [`${FP}/2025/06/7DF4A019LA.png`] },
  { sku: '7D73A03SLA', name: 'Servidor Lenovo ThinkSystem SR630 V3, Xeon Silver 4410Y, 32GB, Rack 1U', brand: 'Lenovo', category: 'servidores', price: 5636, priceBefore: 5750, images: [`${FP}/2025/06/7D73A03SLA.png`] },
  { sku: 'R760XSANH2FY25V3', name: 'Servidor Dell PowerEdge R760xs, Xeon Gold 5418Y 24C, 32GB, 960GB SSD', brand: 'Dell', category: 'servidores', price: 7480, priceBefore: 7520, images: [`${FP}/2025/06/R760XSANH2FY25.png`] },
  { sku: 'R760XSANH2FY25', name: 'Servidor Dell PowerEdge R760xs, Xeon Silver 4410Y 12C, 64GB, 480GB SSD', brand: 'Dell', category: 'servidores', price: 5900, priceBefore: 6100, images: [`${FP}/2025/06/R760XSANH2FY25.png`] },
  { sku: 'R360FY26Q1', name: 'Servidor Dell PowerEdge R360, Xeon E-2434, 16GB, 4TB SATA', brand: 'Dell', category: 'servidores', price: 2999, priceBefore: 3100, images: [`${FP}/2025/06/R360FY26Q1.png`] },
  { sku: 'R660XSANH2FY25v2', name: 'Servidor Dell PowerEdge R660xs, Xeon Silver 4410Y 12C, 16GB, 480GB SSD', brand: 'Dell', category: 'servidores', price: 5138, priceBefore: 5300, images: [`${FP}/2025/06/R660XSANH2FY25v2.png`] },
];

export const discountOf = (p: ShopProduct) =>
  p.priceBefore && p.priceBefore > p.price ? Math.round(((p.priceBefore - p.price) / p.priceBefore) * 100) : 0;
