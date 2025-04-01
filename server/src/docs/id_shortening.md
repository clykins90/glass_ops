# UUID Shortening in API URLs

## Overview

This feature shortens the long UUIDs in API URLs to make them more user-friendly and concise. Instead of displaying the full UUID (like `123e4567-e89b-12d3-a456-426614174000`), the system uses a shorter, URL-safe identifier (like `a1b2c3d4e5`).

## Implementation

The system works by:

1. Converting long UUIDs to shorter IDs for API responses and URLs
2. Converting short IDs back to original UUIDs when processing API requests
3. Maintaining an in-memory mapping between short IDs and original UUIDs

### Components

- **idShortener.ts**: Core utility functions for shortening and expanding IDs
- **idMapping.ts**: Express middleware to handle ID conversion in requests and responses

### Configuration

The short ID has the following characteristics:
- Length: 10 characters
- Character set: Alphanumeric, excluding similar-looking characters (1/l, 0/O)
- Generated using nanoid for secure, URL-safe IDs

## Usage in Routes

The ID shortening middleware is applied to routes in:
- `schedule.routes.ts`
- `technician.routes.ts`

Each route uses:
1. `expandIdsMiddleware`: Converts short IDs to UUIDs in incoming requests
2. `shortenIdsMiddleware`: Converts UUIDs to short IDs in outgoing responses

## Client Integration

The client code doesn't need any changes, as it simply uses whatever IDs are returned by the API. The conversion is transparent to the client.

## Technical Considerations

- **In-memory mapping**: The current implementation stores mappings in memory, which will reset on server restart. For production, consider using a persistent storage solution.
- **ID collision prevention**: The system checks for collisions when generating new short IDs.
- **UUID detection**: The system uses heuristics (presence of hyphens, length) to identify UUIDs in responses.

## Future Improvements

- Add persistent storage for ID mappings
- Add cache expiration for old mappings
- Consider a deterministic approach (hash-based) for generating short IDs 