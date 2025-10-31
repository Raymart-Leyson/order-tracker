import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/sqlite";

const TABLE = "orders";

// ✅ POST — insert multiple orders
export async function POST(req: Request) {
  try {
    const orders = await req.json();

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: "Invalid or empty orders array." }, { status: 400 });
    }

    const insert = db.prepare(`
      INSERT INTO ${TABLE} (client, product, quantity, price, date)
      VALUES (@client, @product, @quantity, @price, @date)
    `);

    const insertMany = db.transaction((orders: any[]) => {
      for (const order of orders) insert.run(order);
    });

    insertMany(orders);

    return NextResponse.json({ insertedCount: orders.length }, { status: 201 });
  } catch (error) {
    console.error("Error inserting orders:", error);
    return NextResponse.json({ error: "Failed to insert orders." }, { status: 500 });
  }
}

// ✅ GET — fetch all orders
export async function GET() {
  try {
    const rows = db.prepare(`SELECT * FROM ${TABLE}`).all();
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// ✅ PATCH — update order (client + product + date)
export async function PATCH(req: NextRequest) {
  try {
    const { client, product, date, quantity, price } = await req.json();

    if (!client || !product || !date) {
      return NextResponse.json(
        { error: "Missing required fields (client, product, date)" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `UPDATE ${TABLE} SET quantity = ?, price = ? WHERE client = ? AND product = ? AND date = ?`
      )
      .run(quantity, price, client, product, date);

    if (result.changes === 0) {
      return NextResponse.json({ error: "No matching order found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// ✅ DELETE — delete order (client + product + date)
export async function DELETE(req: NextRequest) {
  try {
    const { client, product, date } = await req.json();

    if (!client || !product || !date) {
      return NextResponse.json(
        { error: "Missing required fields (client, product, date)" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(`DELETE FROM ${TABLE} WHERE client = ? AND product = ? AND date = ?`)
      .run(client, product, date);

    if (result.changes === 0) {
      return NextResponse.json({ error: "No matching order found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}