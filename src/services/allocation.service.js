import Slot from "../models/Slot.js";
import Token from "../models/Token.js";

/**
 * Allocate a token into a slot based on priority & capacity
 */
export const allocateTokenToSlot = async (slotId, tokenId) => {
  const slot = await Slot.findById(slotId).populate("activeTokens");

  if (!slot) {
    throw new Error("Slot not found");
  }

  const token = await Token.findById(tokenId);

  if (!token) {
    throw new Error("Token not found");
  }

  // CASE 1: Slot has free capacity
  if (slot.activeTokens.length < slot.capacity) {
    slot.activeTokens.push(token._id);
    token.status = "ACTIVE";

    await slot.save();
    await token.save();

    return {
      result: "ALLOCATED",
      message: "Token allocated successfully",
    };
  }

  // CASE 2: Slot full → find lowest priority token
  const lowestPriorityToken = slot.activeTokens.reduce((prev, curr) =>
    prev.priority > curr.priority ? prev : curr,
  );

  // CASE 3: New token has higher priority
  if (token.priority < lowestPriorityToken.priority) {
    // Remove low priority token from active list
    slot.activeTokens = slot.activeTokens.filter(
      (t) => t._id.toString() !== lowestPriorityToken._id.toString(),
    );

    // Move old token to waiting list
    slot.waitingTokens.push(lowestPriorityToken._id);
    lowestPriorityToken.status = "WAITING";

    // Add new token
    slot.activeTokens.push(token._id);
    token.status = "ACTIVE";

    await lowestPriorityToken.save();
    await token.save();
    await slot.save();

    return {
      result: "PREEMPTED",
      message: "Lower priority token moved to waiting list",
    };
  }

  // CASE 4: New token has lower or equal priority
  slot.waitingTokens.push(token._id);
  token.status = "WAITING";

  await slot.save();
  await token.save();

  return {
    result: "WAITLISTED",
    message: "Token added to waiting list",
  };
};
