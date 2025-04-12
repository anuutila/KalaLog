import dayjs from "dayjs";
import { ICatch } from "../types/catch";
import { IEvent } from "../types/event";


export const calculateEventStats = (event: IEvent, allCatches: ICatch[]) => {
  const eventStartDate = dayjs(event.startDate);
  const eventEndDate = dayjs(event.endDate).endOf('day'); // Include full end date
  const participantIds = new Set(event.participants.map(p => p?.id).filter(Boolean));

  const relevantCatches = allCatches.filter(c => {
      const catchDate = dayjs(c.date);
      const isParticipant = participantIds.has(c.caughtBy.userId ?? '') || event.unregisteredParticipants?.includes(c.caughtBy.name);
      const isInDateRange = !catchDate.isBefore(eventStartDate) && !catchDate.isAfter(eventEndDate);
      return isParticipant && isInDateRange;
  });

  let totalCatches = relevantCatches.length;
  let biggestCatchWeight = 0;
  let biggestCatchLength = 0;
  // More stats here

  relevantCatches.forEach(c => {
      if (c.weight && c.weight > biggestCatchWeight) biggestCatchWeight = c.weight;
      if (c.length && c.length > biggestCatchLength) biggestCatchLength = c.length;
  });

  return {
      totalCatches,
      biggestCatchWeight: biggestCatchWeight > 0 ? biggestCatchWeight : null,
      biggestCatchLength: biggestCatchLength > 0 ? biggestCatchLength : null,
      // return other stats here
  };
};