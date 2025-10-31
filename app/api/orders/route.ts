import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

const dbName = "project1";
const collectionName = "orders";

export async function POST(req: NextRequest) {
  try {
    const orders = await req.json();

    // Validation
    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty orders array." },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert
    const result = await collection.insertMany(orders);
    console.log("Inserted orders:", result.insertedCount);

    return NextResponse.json(
      { message: "Orders inserted successfully!", insertedCount: result.insertedCount },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error inserting orders:", error?.message || error);
    return NextResponse.json(
      { error: `Failed to insert orders: ${error?.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const collection = client.db(dbName).collection(collectionName);
    const orders = await collection.find({}).toArray();
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error("GET error:", err?.message || err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { client, product, date, quantity, price } = data;

    if (!client || !product || !date) {
      return NextResponse.json(
        { error: "Missing required fields (client, product, date)" },
        { status: 400 }
      );
    }

    const clientConn = await clientPromise;
    const collection = clientConn.db(dbName).collection(collectionName);

    const updateResult = await collection.updateOne(
      { client, product, date },
      { $set: { quantity, price } }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "No matching order found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (err: any) {
    console.error("PATCH error:", err?.message || err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const { client, product, date } = data;

    if (!client || !product || !date) {
      return NextResponse.json(
        { error: "Missing required fields (client, product, date)" },
        { status: 400 }
      );
    }

    const clientConn = await clientPromise;
    const collection = clientConn.db(dbName).collection(collectionName);

    const deleteResult = await collection.deleteOne({ client, product, date });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: "No matching order found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (err: any) {
    console.error("DELETE error:", err?.message || err);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
