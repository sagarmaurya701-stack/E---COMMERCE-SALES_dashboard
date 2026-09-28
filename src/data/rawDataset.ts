import { RawTransactionRecord } from '../types/ecommerce';

// Deterministic PRNG for reproducible dataset generation
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 6 Categories and 36 Products matching the user's PDF exactly
const CATEGORIES_DATA = [
  {
    category: 'Books & Stationery',
    products: [
      { name: 'Sketchbook', basePrice: 2126.54, baseCost: 1528.71, returnRate: 0.05 },
      { name: 'Fiction Novel', basePrice: 3604.16, baseCost: 2680.72, returnRate: 0.06 },
      { name: 'Notebook Pack', basePrice: 2651.51, baseCost: 1568.01, returnRate: 0.04 },
      { name: 'Highlighter Set', basePrice: 1222.73, baseCost: 790.88, returnRate: 0.03 },
      { name: 'Planner Diary', basePrice: 2623.43, baseCost: 1852.32, returnRate: 0.05 },
      { name: 'Gel Pen Set', basePrice: 2148.09, baseCost: 1504.58, returnRate: 0.04 },
    ],
  },
  {
    category: 'Electronics',
    products: [
      { name: 'Smartwatch', basePrice: 2360.53, baseCost: 1645.52, returnRate: 0.14 },
      { name: 'Wireless Earbuds', basePrice: 4176.97, baseCost: 2940.69, returnRate: 0.16 },
      { name: 'Bluetooth Speaker', basePrice: 1899.10, baseCost: 1142.37, returnRate: 0.12 },
      { name: 'USB-C Cable', basePrice: 4257.06, baseCost: 2391.29, returnRate: 0.11 },
      { name: 'Power Bank', basePrice: 3828.59, baseCost: 2304.51, returnRate: 0.13 },
      { name: 'Laptop Stand', basePrice: 3881.25, baseCost: 2562.32, returnRate: 0.09 },
    ],
  },
  {
    category: 'Fashion',
    products: [
      { name: 'Running Shoes', basePrice: 451.40, baseCost: 274.08, returnRate: 0.22 },
      { name: 'Sunglasses', basePrice: 2672.27, baseCost: 1747.85, returnRate: 0.15 },
      { name: 'Leather Wallet', basePrice: 556.98, baseCost: 308.20, returnRate: 0.12 },
      { name: "Women's Kurti", basePrice: 2545.37, baseCost: 1477.92, returnRate: 0.19 },
      { name: "Men's T-Shirt", basePrice: 4070.17, baseCost: 3029.16, returnRate: 0.18 },
      { name: 'Denim Jeans', basePrice: 315.03, baseCost: 182.53, returnRate: 0.21 },
    ],
  },
  {
    category: 'Beauty & Personal Care',
    products: [
      { name: 'Perfume', basePrice: 3743.46, baseCost: 2126.02, returnRate: 0.06 },
      { name: 'Face Wash', basePrice: 1158.31, baseCost: 736.59, returnRate: 0.07 },
      { name: 'Hair Serum', basePrice: 1219.35, baseCost: 848.38, returnRate: 0.05 },
      { name: 'Lipstick', basePrice: 2217.82, baseCost: 1552.93, returnRate: 0.08 },
      { name: 'Trimmer', basePrice: 2912.93, baseCost: 2132.01, returnRate: 0.09 },
      { name: 'Sunscreen SPF50', basePrice: 246.24, baseCost: 151.37, returnRate: 0.06 },
    ],
  },
  {
    category: 'Home & Kitchen',
    products: [
      { name: 'Mixer Grinder', basePrice: 1001.35, baseCost: 715.01, returnRate: 0.09 },
      { name: 'Storage Container Set', basePrice: 3577.50, baseCost: 2568.93, returnRate: 0.05 },
      { name: 'Bedsheet Set', basePrice: 185.51, baseCost: 129.27, returnRate: 0.07 },
      { name: 'LED Bulb', basePrice: 699.78, baseCost: 388.78, returnRate: 0.04 },
      { name: 'Non-Stick Pan', basePrice: 3624.29, baseCost: 2169.72, returnRate: 0.08 },
      { name: 'Table Lamp', basePrice: 4440.65, baseCost: 2820.09, returnRate: 0.06 },
    ],
  },
  {
    category: 'Sports & Fitness',
    products: [
      { name: 'Skipping Rope', basePrice: 540.68, baseCost: 297.62, returnRate: 0.08 },
      { name: 'Resitance Bands', basePrice: 4188.19, baseCost: 2662.17, returnRate: 0.09 },
      { name: 'Dumbbell Set', basePrice: 1488.71, baseCost: 856.43, returnRate: 0.07 },
      { name: 'Football', basePrice: 3040.11, baseCost: 1980.26, returnRate: 0.06 },
      { name: 'Yoga Mat', basePrice: 1815.16, baseCost: 1212.21, returnRate: 0.08 },
      { name: 'Cricket Bat', basePrice: 3836.28, baseCost: 2406.48, returnRate: 0.10 },
    ],
  },
];

// Cities and Regions from the PDF
const LOCATIONS = [
  { city: 'Delhi', region: 'North', rawRegions: ['North', 'north'] },
  { city: 'Lucknow', region: 'North', rawRegions: ['North', 'north'] },
  { city: 'Chandigarh', region: 'North', rawRegions: ['North', 'north'] },
  { city: 'Jaipur', region: 'North', rawRegions: ['North', 'north'] },
  { city: 'Chennai', region: 'South', rawRegions: ['South', 'south'] },
  { city: 'Bengaluru', region: 'South', rawRegions: ['South', 'south'] },
  { city: 'Hyderabad', region: 'South', rawRegions: ['South', 'south'] },
  { city: 'Kochi', region: 'South', rawRegions: ['South', 'south'] },
  { city: 'Kolkata', region: 'East', rawRegions: ['East', 'east'] },
  { city: 'Patna', region: 'East', rawRegions: ['East', 'east'] },
  { city: 'Guwahati', region: 'East', rawRegions: ['East', 'east'] },
  { city: 'Bhubaneswar', region: 'East', rawRegions: ['East', 'east'] },
  { city: 'Mumbai', region: 'West', rawRegions: ['West', 'west'] },
  { city: 'Pune', region: 'West', rawRegions: ['West', 'west'] },
  { city: 'Surat', region: 'West', rawRegions: ['West', 'west'] },
  { city: 'Ahmedabad', region: 'West', rawRegions: ['West', 'west'] },
];

const PAYMENT_METHODS = ['Debit Card', 'Credit Card', 'UPI', 'Net Banking', 'Cash on Delivery'];
const DISCOUNTS = [0, 5, 10, 15, 20, 25];
const RETURN_REASONS = [
  'Size/Fit Issue',
  'Changed Mind',
  'Not as Described',
  'Better Price Found',
  'Product Damaged',
];

// Specific known negative price rows from user PDF
const NEGATIVE_PRICE_ROWS = new Set([160, 831, 1938, 1945, 2359, 3007, 3435, 4025]);

// Specific known outlier quantity rows from user PDF
const OUTLIER_QTY_MAP: Record<number, number> = {
  140: 250,
  531: 120,
  831: 500,
  891: 250,
  1080: 500,
  1606: 120,
  1713: 250,
  2528: 500,
  3129: 120,
  4069: 500,
  4182: 500,
  4535: 250,
  4539: 250,
  5832: 120,
  5972: 120,
};

// Known rows with missing Unit Price from user PDF
const MISSING_PRICE_ROWS = new Set([
  8, 22, 80, 133, 233, 234, 254, 348, 431, 532, 561, 562, 573, 613, 674, 754, 770, 819, 830, 845, 864, 
  921, 944, 961, 968, 978, 1058, 1068, 1108, 1185, 1207, 1235, 1318, 1334, 1376, 1413, 1435, 1457, 
  1529, 1636, 1639, 1682, 1685, 1709, 1781, 1785, 1797, 1935, 1967, 1973, 1990, 2015, 2055, 2096, 
  2160, 2229, 2249, 2257, 2267, 2284, 2343, 2377, 2379, 2420, 2466, 2558, 2586, 2613, 2638, 2640, 
  2643, 2659, 2721, 2771, 2775, 2812, 2901, 2921, 2948, 2964, 2994, 3001, 3005, 3025, 3047, 3101, 
  3113, 3125, 3127, 3142, 3145, 3228, 3246, 3270, 3320, 3345, 3422, 3430, 3448, 3464, 3505, 3508, 
  3541, 3624, 3639, 3675, 3687, 3695, 3720, 3742, 3745, 3750, 3757, 3817, 3839, 3857, 3862, 3882, 
  3954, 3973, 4005, 4007, 4089, 4108, 4146, 4165, 4182, 4231, 4269, 4284, 4348, 4426, 4456, 4486, 
  4521, 4544, 4570, 4587, 4677, 4755, 4756, 4826, 4832, 4990, 5011, 5022, 5075, 5116, 5138, 5212, 
  5227, 5449, 5468, 5478, 5506, 5578, 5580, 5602, 5611, 5674, 5741, 5800, 5862, 5972, 6019, 6043, 6062
]);

// Missing payment method rows
const MISSING_PAYMENT_ROWS = new Set([8, 20, 41, 80, 114, 187, 234, 348, 431, 532, 706, 845, 1068, 1235, 1457, 1682, 1709, 2055, 2229, 2466, 2640, 2771, 2964, 3246, 3345, 3448, 3750, 4089, 4108, 4486, 4587, 4826, 5011, 5227, 5468, 5862, 6062]);

export function generateRawDataset(): RawTransactionRecord[] {
  const rand = mulberry32(100364);
  const totalRows = 6090;
  const records: RawTransactionRecord[] = [];

  const startTimestamp = new Date(2024, 0, 1).getTime();
  const endTimestamp = new Date(2025, 11, 31).getTime();

  for (let row = 1; row <= totalRows; row++) {
    // Pick category and product
    const catIdx = Math.floor(rand() * CATEGORIES_DATA.length);
    const catObj = CATEGORIES_DATA[catIdx];
    const prodIdx = Math.floor(rand() * catObj.products.length);
    const prodObj = catObj.products[prodIdx];

    // Pick location (city + region with casing)
    const locIdx = Math.floor(rand() * LOCATIONS.length);
    const loc = LOCATIONS[locIdx];
    const rawRegion = loc.rawRegions[Math.floor(rand() * loc.rawRegions.length)];

    // Quantity
    let quantity: number | null = 1;
    if (OUTLIER_QTY_MAP[row]) {
      quantity = OUTLIER_QTY_MAP[row];
    } else {
      const qRoll = rand();
      if (qRoll < 0.48) quantity = 1;
      else if (qRoll < 0.76) quantity = 2;
      else if (qRoll < 0.88) quantity = 3;
      else if (qRoll < 0.95) quantity = 4;
      else quantity = 5;
    }

    // Unit Price and Cost Price
    const priceVariance = 0.88 + rand() * 0.24;
    let unitPrice: number | null = Math.round(prodObj.basePrice * priceVariance * 100) / 100;
    let costPrice = Math.round(prodObj.baseCost * (0.92 + rand() * 0.16) * 100) / 100;

    // Check negative price rows
    if (NEGATIVE_PRICE_ROWS.has(row)) {
      unitPrice = -Math.abs(unitPrice);
    }

    // Check missing price rows
    if (MISSING_PRICE_ROWS.has(row)) {
      unitPrice = null;
    }

    // Discount %
    const discountPct = DISCOUNTS[Math.floor(rand() * DISCOUNTS.length)];

    // Dates across 2024 and 2025
    const time = startTimestamp + rand() * (endTimestamp - startTimestamp);
    const d = new Date(time);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    // Inconsistent date formats (~25% in DD-MM-YYYY format, matching PDF)
    let orderDate = `${yyyy}-${mm}-${dd}`;
    if (rand() < 0.25) {
      orderDate = `${dd}-${mm}-${yyyy}`;
    }

    // Payment Method
    let paymentMethod: string | null = PAYMENT_METHODS[Math.floor(rand() * PAYMENT_METHODS.length)];
    if (MISSING_PAYMENT_ROWS.has(row)) {
      paymentMethod = null;
    }

    // Order Status & Return Reason
    let orderStatus: 'Delivered' | 'Returned' | 'Cancelled' = 'Delivered';
    let returnReason: string | null = null;

    const statusRoll = rand();
    if (statusRoll < prodObj.returnRate) {
      orderStatus = 'Returned';
      returnReason = RETURN_REASONS[Math.floor(rand() * RETURN_REASONS.length)];
    } else if (statusRoll < prodObj.returnRate + 0.05) {
      orderStatus = 'Cancelled';
    }

    // Order ID and Customer ID matching user PDF pattern
    // e.g. ORD100364, CUST2731
    const orderIdNum = 100000 + Math.floor(rand() * 60000);
    const orderId = `ORD${orderIdNum}`;
    const customerId = `CUST${1000 + Math.floor(rand() * 2500)}`;

    records.push({
      row,
      orderId,
      orderDate,
      customerId,
      category: catObj.category,
      productName: prodObj.name,
      quantity,
      unitPrice,
      discountPct,
      costPrice,
      region: rawRegion,
      city: loc.city,
      paymentMethod,
      orderStatus,
      returnReason,
    });
  }

  // Exact row 1..10 overrides to guarantee 100% fidelity with page 1 screenshot:
  records[0] = { row: 1, orderId: 'ORD100364', orderDate: '2024-01-07', customerId: 'CUST2731', category: 'Books & Stationery', productName: 'Sketchbook', quantity: 1, unitPrice: 2126.54, discountPct: 0, costPrice: 1528.71, region: 'South', city: 'Chennai', paymentMethod: 'Debit Card', orderStatus: 'Delivered', returnReason: null };
  records[1] = { row: 2, orderId: 'ORD101424', orderDate: '2025-03-10', customerId: 'CUST2734', category: 'Electronics', productName: 'Smartwatch', quantity: 5, unitPrice: 2360.53, discountPct: 5, costPrice: 1645.52, region: 'East', city: 'Bhubaneswar', paymentMethod: 'Credit Card', orderStatus: 'Delivered', returnReason: null };
  records[2] = { row: 3, orderId: 'ORD102061', orderDate: '2024-05-09', customerId: 'CUST2384', category: 'Books & Stationery', productName: 'Fiction Novel', quantity: 1, unitPrice: 3604.16, discountPct: 0, costPrice: 2680.72, region: 'South', city: 'Bengaluru', paymentMethod: 'UPI', orderStatus: 'Delivered', returnReason: null };
  records[3] = { row: 4, orderId: 'ORD100954', orderDate: '2024-01-10', customerId: 'CUST1593', category: 'Books & Stationery', productName: 'Notebook Pack', quantity: 1, unitPrice: 2651.51, discountPct: 0, costPrice: 1568.01, region: 'East', city: 'Kolkata', paymentMethod: 'Net Banking', orderStatus: 'Delivered', returnReason: null };
  records[4] = { row: 5, orderId: 'ORD105797', orderDate: '2024-12-14', customerId: 'CUST3183', category: 'Fashion', productName: 'Running Shoes', quantity: 1, unitPrice: 451.40, discountPct: 0, costPrice: 274.08, region: 'North', city: 'Delhi', paymentMethod: 'Net Banking', orderStatus: 'Returned', returnReason: 'Size/Fit Issue' };
  records[5] = { row: 6, orderId: 'ORD103065', orderDate: '2025-01-29', customerId: 'CUST2268', category: 'Fashion', productName: 'Sunglasses', quantity: 3, unitPrice: 2672.27, discountPct: 20, costPrice: 1747.85, region: 'South', city: 'Bengaluru', paymentMethod: 'Cash on Delivery', orderStatus: 'Delivered', returnReason: null };
  records[6] = { row: 7, orderId: 'ORD100454', orderDate: '2024-09-27', customerId: 'CUST2377', category: 'Books & Stationery', productName: 'Fiction Novel', quantity: 1, unitPrice: 2980.84, discountPct: 0, costPrice: 2160.65, region: 'East', city: 'Bhubaneswar', paymentMethod: 'UPI', orderStatus: 'Delivered', returnReason: null };
  records[7] = { row: 8, orderId: 'ORD102090', orderDate: '2024-06-02', customerId: 'CUST2747', category: 'Beauty & Personal Care', productName: 'Perfume', quantity: 1, unitPrice: null, discountPct: 15, costPrice: 2757.20, region: 'West', city: 'Mumbai', paymentMethod: null, orderStatus: 'Delivered', returnReason: null };
  records[8] = { row: 9, orderId: 'ORD105577', orderDate: '2025-02-06', customerId: 'CUST3341', category: 'Electronics', productName: 'Wireless Earbuds', quantity: 5, unitPrice: 4176.97, discountPct: 10, costPrice: 2940.69, region: 'North', city: 'Lucknow', paymentMethod: 'Debit Card', orderStatus: 'Delivered', returnReason: null };
  records[9] = { row: 10, orderId: 'ORD100565', orderDate: '2024-12-29', customerId: 'CUST2241', category: 'Books & Stationery', productName: 'Highlighter Set', quantity: 2, unitPrice: 1222.73, discountPct: 0, costPrice: 790.88, region: 'South', city: 'Hyderabad', paymentMethod: 'Net Banking', orderStatus: 'Delivered', returnReason: null };

  // Explicit overrides for the 8 negative price rows:
  records[159] = { row: 160, orderId: 'ORD103022', orderDate: '2024-06-08', customerId: 'CUST3114', category: 'Fashion', productName: 'Running Shoes', quantity: 1, unitPrice: -1779.96, discountPct: 5, costPrice: 1145.97, region: 'North', city: 'Delhi', paymentMethod: 'Net Banking', orderStatus: 'Delivered', returnReason: null };
  records[830] = { row: 831, orderId: 'ORD105845', orderDate: '2025-02-20', customerId: 'CUST2140', category: 'Fashion', productName: 'Running Shoes', quantity: 500, unitPrice: -2758.17, discountPct: 15, costPrice: 1754.30, region: 'South', city: 'Kochi', paymentMethod: 'UPI', orderStatus: 'Returned', returnReason: 'Size/Fit Issue' };
  records[1937] = { row: 1938, orderId: 'ORD105838', orderDate: '2025-12-08', customerId: 'CUST2906', category: 'Electronics', productName: 'USB-C Cable', quantity: 1, unitPrice: -3102.81, discountPct: 15, costPrice: 1748.38, region: 'West', city: 'Surat', paymentMethod: 'UPI', orderStatus: 'Delivered', returnReason: null };
  records[1944] = { row: 1945, orderId: 'ORD102845', orderDate: '2025-11-29', customerId: 'CUST2209', category: 'Fashion', productName: 'Sunglasses', quantity: 4, unitPrice: -541.44, discountPct: 5, costPrice: 328.82, region: 'West', city: 'Mumbai', paymentMethod: 'Credit Card', orderStatus: 'Delivered', returnReason: null };
  records[2358] = { row: 2359, orderId: 'ORD100689', orderDate: '2025-11-09', customerId: 'CUST2503', category: 'Sports & Fitness', productName: 'Skipping Rope', quantity: 2, unitPrice: -3484.34, discountPct: 10, costPrice: 2323.16, region: 'North', city: 'Chandigarh', paymentMethod: 'Cash on Delivery', orderStatus: 'Delivered', returnReason: null };
  records[3006] = { row: 3007, orderId: 'ORD101047', orderDate: '2025-05-18', customerId: 'CUST1636', category: 'Fashion', productName: "Men's T-Shirt", quantity: 2, unitPrice: -689.87, discountPct: 0, costPrice: 396.18, region: 'West', city: 'Mumbai', paymentMethod: 'UPI', orderStatus: 'Delivered', returnReason: null };
  records[3434] = { row: 3435, orderId: 'ORD103549', orderDate: '2025-12-09', customerId: 'CUST1125', category: 'Books & Stationery', productName: 'Planner Diary', quantity: 3, unitPrice: -517.72, discountPct: 10, costPrice: 333.35, region: 'South', city: 'Bengaluru', paymentMethod: 'Debit Card', orderStatus: 'Delivered', returnReason: null };
  records[4024] = { row: 4025, orderId: 'ORD104117', orderDate: '2025-06-24', customerId: 'CUST1792', category: 'Sports & Fitness', productName: 'Dumbbell Set', quantity: 1, unitPrice: -1032.92, discountPct: 20, costPrice: 746.24, region: 'South', city: 'Chennai', paymentMethod: 'Net Banking', orderStatus: 'Delivered', returnReason: null };

  // Explicit override for row 6090:
  records[6089] = { row: 6090, orderId: 'ORD102916', orderDate: '2025-07-20', customerId: 'CUST1582', category: 'Fashion', productName: 'Leather Wallet', quantity: 1, unitPrice: 3510.49, discountPct: 20, costPrice: 2117.16, region: 'West', city: 'Surat', paymentMethod: 'Cash on Delivery', orderStatus: 'Delivered', returnReason: null };

  // Add duplicate rows (~65 duplicates, matching the resume bullet & prompt)
  for (let d = 0; d < 65; d++) {
    const src = records[30 + d * 75];
    if (src) {
      records.push({
        ...src,
        row: totalRows + d + 1,
      });
    }
  }

  return records;
}

let _cachedDataset: RawTransactionRecord[] | null = null;
export function getRawDataset(): RawTransactionRecord[] {
  if (!_cachedDataset) {
    _cachedDataset = generateRawDataset();
  }
  return _cachedDataset;
}
