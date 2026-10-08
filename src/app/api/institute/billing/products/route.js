import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products-stock.json');


async function getStoredProducts() {
  try {
    const raw = await readFile(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (err) {
    await saveProducts([]);
    return [];
  }
}

async function saveProducts(products) {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write products stock file:', err);
  }
}

// GET: Returns current product stock list
export async function GET() {
  try {
    const products = await getStoredProducts();
    return NextResponse.json({ success: true, products });
  } catch (err) {
    console.error('Error fetching products stock:', err);
    return NextResponse.json({ success: false, products: [] }, { status: 500 });
  }
}

// POST: Add new product or Restock existing product (ADMIN ONLY)
export async function POST(req) {
  try {
    const body = await req.json();
    const { action, role, name, price, stock, unit, productId, addQty } = body;

    // Enforce Admin Only for adding products or adding stock
    if (role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission Denied: Stock can only be added or modified by Admin.' },
        { status: 403 }
      );
    }

    const products = await getStoredProducts();

    // Case 1: Restock an existing product (+addQty)
    if (action === 'add_stock') {
      const qtyNum = Number(addQty);
      if (!productId || isNaN(qtyNum) || qtyNum <= 0) {
        return NextResponse.json({ error: 'Please enter a valid stock quantity to add.' }, { status: 400 });
      }

      let found = false;
      const updated = products.map((p) => {
        if (p.id === productId || p.name.toLowerCase() === String(productId).toLowerCase()) {
          found = true;
          return {
            ...p,
            stock: (Number(p.stock) || 0) + qtyNum,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });

      if (!found) {
        return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
      }

      await saveProducts(updated);
      return NextResponse.json({ success: true, products: updated, message: `Successfully added ${qtyNum} stock!` });
    }

    // Case 2: Create a new product
    if (action === 'create_product') {
      const cleanName = (name || '').trim();
      const priceNum = Number(price);
      const stockNum = Number(stock) || 0;

      if (!cleanName) {
        return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
      }

      if (products.some((p) => p.name.toLowerCase() === cleanName.toLowerCase())) {
        return NextResponse.json({ error: `Product "${cleanName}" already exists.` }, { status: 400 });
      }

      const newProd = {
        id: 'PROD-' + Date.now(),
        name: cleanName,
        price: isNaN(priceNum) || priceNum < 0 ? 0 : priceNum,
        stock: stockNum,
        totalSold: 0,
        unit: (unit || 'pcs').trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updated = [...products, newProd];
      await saveProducts(updated);
      return NextResponse.json({ success: true, products: updated, product: newProd, message: `Product "${cleanName}" created with ${stockNum} initial stock!` });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (err) {
    console.error('Error in POST /api/institute/billing/products:', err);
    return NextResponse.json({ error: 'Failed to process stock operation.' }, { status: 500 });
  }
}

export async function reduceStockInternal(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return await getStoredProducts();
  }

  const products = await getStoredProducts();
  let modified = false;

  const updated = products.map((prod) => {
    // Check if this product was sold in the bill items
    const matchedItem = items.find((it) => {
      if (!it) return false;
      if (it.id && it.id === prod.id) return true;
      if (it.productId && it.productId === prod.id) return true;
      if (!it.name) return false;
      const itName = it.name.trim().toLowerCase();
      const prodName = prod.name.trim().toLowerCase();
      return itName === prodName || prodName.includes(itName) || itName.includes(prodName);
    });

    if (matchedItem) {
      modified = true;
      const qtySold = Number(matchedItem.qty) || 1;
      const currentStock = Number(prod.stock) || 0;
      const newStock = Math.max(0, currentStock - qtySold);
      const currentSold = Number(prod.totalSold) || 0;

      return {
        ...prod,
        stock: newStock,
        totalSold: currentSold + qtySold,
        updatedAt: new Date().toISOString()
      };
    }
    return prod;
  });

  if (modified) {
    await saveProducts(updated);
  }
  return updated;
}

// PUT: Auto-reduce stock when product is sold in billing (Accessible to any billing user)
export async function PUT(req) {
  try {
    const body = await req.json();
    const { action, items } = body;

    if (action === 'reduce_stock') {
      const updated = await reduceStockInternal(items);
      return NextResponse.json({ success: true, products: updated, message: 'Stock auto-reduced successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Error reducing product stock:', err);
    return NextResponse.json({ error: 'Failed to reduce product stock' }, { status: 500 });
  }
}

// DELETE: Admin removes a product
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const role = searchParams.get('role');

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Permission Denied: Only Admin can delete products.' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const products = await getStoredProducts();
    const updated = products.filter((p) => p.id !== id);
    await saveProducts(updated);

    return NextResponse.json({ success: true, products: updated, message: 'Product removed successfully.' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return NextResponse.json({ error: 'Failed to delete product.' }, { status: 500 });
  }
}
