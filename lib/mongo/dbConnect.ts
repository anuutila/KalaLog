import mongoose from 'mongoose';

const MONGODB_URI_DEV = process.env.MONGODB_URI_DEV;
const MONGODB_URI_PROD = process.env.MONGODB_URI_PROD;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!MONGODB_URI_DEV || !MONGODB_URI_PROD) {
  throw new Error('Please define MONGODB_URI_DEV and MONGODB_URI_PROD in your environment variables');
}

const MONGODB_URI = NODE_ENV === 'production' ? MONGODB_URI_PROD : MONGODB_URI_DEV;

// interface MongooseCache {
//   conn: typeof mongoose | null;
//   promise: Promise<typeof mongoose> | null;
// }

// declare global {
//   var mongoose: MongooseCache;
// }

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function dbConnect() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     };

//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
//       return mongoose;
//     });
//   }
//   cached.conn = await cached.promise;
//   return cached.conn;
// }

const connection: {isConnected?: number} = {};

async function dbConnect() {
  if (connection.isConnected) {
    return;
  }

  const db = await mongoose.connect(MONGODB_URI);

  connection.isConnected = db.connections[0].readyState;
}

export default dbConnect;