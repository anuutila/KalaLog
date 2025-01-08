
import mongoose from 'mongoose';

const assignNumbers = async () => {
  try {
    await mongoose.connect(''); // Replace with your DB URI

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
      catchNumber: { type: Number, required: true, unique: true },
    });
    
    const Catch = mongoose.model('Catch', CatchSchema);

    const catches = await Catch.find({}).sort({ date: 1, time: 1 }); // Sort by date or another criterion
    console.log(`Found ${catches.length} catches`);
    // console.log(catches);
    for (let i = 0; i < catches.length; i++) {
      catches[i].catchNumber = i + 1; // Assign running number starting from 1
      await catches[i].save();
    }

    console.log('Numbers assigned successfully');
  } catch (error) {
    console.error('Error assigning numbers:', error);
  } finally {
    mongoose.disconnect();
  }
};

assignNumbers();
