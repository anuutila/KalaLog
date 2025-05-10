import dayjs from "dayjs";
import { ICatch } from "../types/catch";
import { IEvent } from "../types/event";

export interface IEventStats {
  eventCatches: ICatch[];
  totalCatches: number;
  biggestCatchWeight: number | null;
  biggestCatchLength: number | null;
}

export const calculateEventStats = (event: IEvent, allCatches: ICatch[]): IEventStats => {
  const eventStartDate = dayjs(event.startDate);
  const eventEndDate = dayjs(event.endDate).endOf('day'); // Include full end date
  const participantIds = new Set(event.participants.map(p => p?.id).filter(Boolean));

  const relevantCatches = allCatches.filter(c => {
    const catchDate = dayjs(c.date);
    const isParticipant = participantIds.has(c.caughtBy.userId ?? '') || event.unregisteredParticipants?.includes(c.caughtBy.name);
    const isInDateRange = !catchDate.isBefore(eventStartDate) && !catchDate.isAfter(eventEndDate);
    return isParticipant && isInDateRange;
  });

  let eventCatches = relevantCatches ?? [];
  let totalCatches = eventCatches.length;
  let biggestCatchWeight = 0;
  let biggestCatchLength = 0;
  // More stats here

  relevantCatches.forEach(c => {
    if (c.weight && c.weight > biggestCatchWeight) biggestCatchWeight = c.weight;
    if (c.length && c.length > biggestCatchLength) biggestCatchLength = c.length;
  });

  return {
    eventCatches,
    totalCatches,
    biggestCatchWeight: biggestCatchWeight > 0 ? biggestCatchWeight : null,
    biggestCatchLength: biggestCatchLength > 0 ? biggestCatchLength : null,
  };
};

export const generateAllParticipantNames = (event: IEvent): string[] => {
  const participantNames = event.participants
    .map(p => p ? `${p.firstName} ${p.lastName}` : 'Unknown User');
  const unregisteredNames = event.unregisteredParticipants || [];
  const allParticipantNames = [...participantNames, ...unregisteredNames].sort();
  return allParticipantNames;
}