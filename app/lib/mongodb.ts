import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MongoDB URI is missing!");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Use a global variable in development to prevent creating multiple connections
if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, always create a new connection
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
