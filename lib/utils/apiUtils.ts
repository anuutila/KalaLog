import dbConnect from '@lib/mongo/dbConnect';
import Catch from '@lib/mongo/models/catch';
import { IUser } from '@/lib/types/user';
import { ICatch, ICatchSchema } from '@/lib/types/catch';

export const linkCatchesToUser = async (user: Omit<IUser, 'password' | 'email'>): Promise<{ count: number; linkedName: string }> => {
  await dbConnect();

  try {
    const unlinkedCatches = await Catch.find({
      $or: [
        { 'caughtBy.userId': { $exists: false } },
        { 'caughtBy.userId': null }
      ]
    });

    const catchesAlreadyLinkedToUser = await Catch.find({
      'caughtBy.userId': user.id
    });

    console.log(`Found ${unlinkedCatches.length} unlinked catches`);
    console.log(`Found ${catchesAlreadyLinkedToUser.length} catches already linked to user ${user.firstName} (${user.username})`);
  
    const parsedUnlinkedCatches: ICatch[] = unlinkedCatches.map(catchItem => (
      ICatchSchema.parse({
        ...catchItem.toObject(),
        id: catchItem._id?.toString(),
        caughtBy: {
          ...catchItem.caughtBy,
          userId: catchItem.caughtBy.userId?.toString() || null,
        },
        createdBy: catchItem.createdBy?.toString(),
      })
    ));
  
  
    const firstName = user.firstName;
    const lastNameInitial = user.lastName.charAt(0).toUpperCase();
  
    const catchesWithExactName: (string | undefined)[] = [];
    const catchesWithInitial: (string | undefined)[] = [];
    const anglerInitials = new Set();
  
    // Separate catches by name type
    parsedUnlinkedCatches.forEach(catchItem => {
      const anglerName = catchItem.caughtBy.name;
  
      // Case 1: Exact First Name (e.g., "Akseli")
      if (anglerName === firstName) {
        catchesWithExactName.push(catchItem.id);
      }
  
      // Case 2: First Name with Initial (e.g., "Akseli N.")
      const regex = new RegExp(`^${firstName} ([A-Z])\\.?$`); // Matches "Akseli X."
      const match = anglerName.match(regex);
  
      if (match) {
        const anglerInitial = match[1];
        anglerInitials.add(anglerInitial); // Track all initials found
  
        if (anglerInitial === lastNameInitial) {
          // Initial matches the new user's last name
          catchesWithInitial.push(catchItem.id);
        }
      }
    });
  
    const catchesToLink = [];
    let linkedName: string = ''; 
  
    if (catchesWithInitial.length > 0) {
      // If there are catches with matching initials, link only those
      catchesToLink.push(...catchesWithInitial);
      linkedName = `${firstName} ${lastNameInitial}.`;
    } else if (catchesWithExactName.length > 0) {
      // If no initialed names exist, link exact first name catches
      catchesToLink.push(...catchesWithExactName);
      linkedName = firstName;
    }
  
    // Update the database and return the number of linked catches
    if (catchesToLink.length > 0) {
      const updateResult = await Catch.updateMany(
        { _id: { $in: catchesToLink } },
        { $set: { 'caughtBy.name': user.firstName, 'caughtBy.userId': user.id, 'caughtBy.username': user.username, 'caughtBy.lastName': user.lastName } }
      );
  
      console.log(`Linked ${updateResult.modifiedCount} catches to user ${user.firstName} (${user.username})`);
      return { count: updateResult.modifiedCount, linkedName };  // Return the number of linked catches
    } else {
      console.log('No catches were linked to this user.');
      return { count: 0, linkedName };
    }
  } catch (error) {
    console.error(`An error occurred while linking catches to the new user: ${error}`);
    throw new Error(`An error occurred while linking catches to the new user`);
  }
};