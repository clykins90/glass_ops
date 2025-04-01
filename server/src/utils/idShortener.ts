import { customAlphabet } from 'nanoid';

/**
 * Utility functions for shortening UUIDs in API URLs and converting them back
 */

// Short ID length - can be adjusted based on the needed uniqueness vs. length tradeoff
// 10 characters gives a good balance between uniqueness and brevity
const SHORT_ID_LENGTH = 10;

// Characters used for the shortened IDs - using URL-safe characters
// excluding similar-looking characters like 1/l, 0/O to avoid confusion
const SAFE_CHARS = '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

// Map to store the mapping between short IDs and original UUIDs
const shortToUuid = new Map<string, string>();
const uuidToShort = new Map<string, string>();

// Custom nanoid generator using our safe characters
const generateShortId = customAlphabet(SAFE_CHARS, SHORT_ID_LENGTH);

/**
 * Converts a UUID to a shorter ID for use in URLs
 * @param uuid The original UUID to shorten
 * @returns A shorter ID that can be used in URLs
 */
export const shortenId = (uuid: string): string => {
  // Check if we already have a short ID for this UUID
  if (uuidToShort.has(uuid)) {
    return uuidToShort.get(uuid)!;
  }

  // Generate a new short ID
  let shortId: string;
  do {
    shortId = generateShortId();
  } while (shortToUuid.has(shortId)); // Ensure uniqueness

  // Store the mapping
  shortToUuid.set(shortId, uuid);
  uuidToShort.set(uuid, shortId);

  return shortId;
};

/**
 * Converts a shortened ID back to the original UUID
 * @param shortId The shortened ID to convert
 * @returns The original UUID or the same ID if no mapping exists
 */
export const expandId = (shortId: string): string => {
  // If the shortId is already in UUID format, return it as is
  if (shortId && shortId.includes('-') && shortId.length > 30) {
    return shortId;
  }
  
  // Return the mapped UUID or the original ID if no mapping exists
  return shortToUuid.get(shortId) || shortId;
}; 