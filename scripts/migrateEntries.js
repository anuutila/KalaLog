import mongoose from 'mongoose';

// Connect to the production database
const uri = "";
mongoose.connect(uri);

function capitalizeFirstLetter(value) {
  if (!value || typeof value !== 'string') return null; // Return null for invalid or empty input
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

const EntrySchema = new mongoose.Schema({
  fish: String,
  date: String,
  length: String,
  weight: String,
  lure: String,
  place: String,
  coordinates: String,
  time: String,
  person: String,
});

const Entry = mongoose.model('Entry', EntrySchema);

const CatchSchema = new mongoose.Schema({
  species: { type: String, required: true },
  date: { type: String, required: true },
  length: { type: Number, required: false },
  weight: { type: Number, required: false },
  lure: { type: String, required: false },
  location: {
    bodyOfWater: { type: String, required: true, default: 'Nerkoonjärvi' },
    spot: { type: String, required: false },
    coordinates: { type: String, required: false },
  },
  time: { type: String, required: true },
  caughtBy: {
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  images: [
    {
      url: { type: String, required: true },
      description: { type: String, required: false },
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  createdAt: { type: Date, default: Date.now },
});

const Catch = mongoose.model('Catch', CatchSchema);

async function migrateEntries() {
  try {
    const entries = await Entry.find({}, {__v: 0, _id: 0});
    console.log(`Found ${entries.length} entries to migrate.`);

    const catches = entries.map((entry) => ({
      species: capitalizeFirstLetter(entry.fish),
      date: entry.date,
      length: entry.length && !isNaN(entry.length) ? parseFloat(entry.length) : null,
      weight: entry.weight && !isNaN(entry.weight) ? parseFloat(entry.weight) : null,
      lure: entry.lure !== "-" ? capitalizeFirstLetter(entry.lure) : null,
      location: {
        bodyOfWater: 'Nerkoonjärvi', // Default value
        spot: entry.place !== "-" ? capitalizeFirstLetter(entry.place) : null,
        coordinates: entry.coordinates !== "-" ? entry.coordinates : null,
      },
      time: entry.time,
      caughtBy: {
        name: capitalizeFirstLetter(entry.person),
        userId: null, // No user association yet
      },
      images: [], // No images initially
      createdBy: null, // No creator associated yet
      createdAt: new Date(entry.date + 'T' + entry.time), // Combine date and time
    }));

    // Insert transformed documents into the new collection
    const result = await Catch.insertMany(catches);
    console.log(`Successfully migrated ${result.length} entries.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrateEntries();
