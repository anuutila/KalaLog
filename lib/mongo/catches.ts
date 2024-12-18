import clientPromise from '@lib/mongo/index';
import { Collection, Db } from 'mongodb';
import { ICatch } from '@/lib/types/catch';

let client;
let db: Db;
let catches: Collection<ICatch>;

async function init() {
  if (db) return;
  try {
    client = await clientPromise;
    db = client.db('kalakalenteri-entries');
    catches = db.collection<ICatch>('entries');
  } catch (e) {
    throw new Error('Failed to establish connection to database');
  }
}

(async () => {
  await init();
})();

export async function getCatches(): Promise<{ catches: ICatch[]; error?: string }> {
  try {
    if (!catches) await init();
    const rawData = await catches.find({}).toArray();

    const formattedResult = rawData.map((entry) => {
      return {
        ...entry,
        weight: Number(entry.weight),
        length: Number(entry.length),
        id: entry._id.toString(),
        _id: undefined, // Removes the original _id
        __v: undefined, // Removes the __v field if present
      };
    });

    return { catches: formattedResult };
  } catch (e) {
    return { catches: [], error: 'Failed to fetch catches!' };
  }
}
