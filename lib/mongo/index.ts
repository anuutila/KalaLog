import { MongoClient } from 'mongodb';

const MONGODB_URI_DEV = process.env.MONGODB_URI_DEV;
const MONGODB_URI_PROD = process.env.MONGODB_URI_PROD;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!MONGODB_URI_DEV || !MONGODB_URI_PROD) {
  throw new Error('Please define MONGODB_URI_DEV and MONGODB_URI_PROD in your environment variables');
}

const URI = NODE_ENV === 'production' ? MONGODB_URI_PROD : MONGODB_URI_DEV;
const options = {};

if (!URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const client = new MongoClient(URI, options);
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV !== 'production') {
  if (!(global as any)._mongoClientPromise) {
    (global as any)._mongoClientPromise = client.connect();
  }

  clientPromise = (global as any)._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;
