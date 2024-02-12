import { v1 } from "@googlemaps/places";
import path from "path";

const { GOOGLE_KEY_FILE_PATH, GOOGLE_PROJECT_ID } = process.env;

if (!GOOGLE_KEY_FILE_PATH || !GOOGLE_PROJECT_ID) {
  console.error("GOOGLE_KEY_FILE_PATH and GOOGLE_PROJECT_ID are required", {
    GOOGLE_KEY_FILE_PATH,
    GOOGLE_PROJECT_ID,
  });
  throw new Error("GOOGLE_KEY_FILE_PATH and GOOGLE_PROJECT_ID are required");
}

const serviceAccount = require(
  path.resolve(__dirname, "../..", GOOGLE_KEY_FILE_PATH),
);

// Create google auth client with API Key
// const authClient = new google.

// Imports the Places library
const { PlacesClient } = v1;

// Instantiates a client
const placesClient = new PlacesClient({
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
});

export default placesClient;

export async function getPlacePhoto(placeId: string) {
  return new Promise<string>((resolve) => {
    placesClient.getPlace(
      { name: `places/${placeId}` },
      {
        otherArgs: {
          headers: {
            "X-Goog-FieldMask": "photos,formatted_address",
          },
        },
        maxResults: 10,
      },
      (err, place) => {
        if (err) {
          console.error("Error fetching place", place);
          return resolve("");
        }

        const placePhotoName = place?.photos?.[0]?.name;

        if (!placePhotoName) {
          console.error("No photo found for place", place);
          return resolve("");
        }

        placesClient.getPhotoMedia(
          {
            name: `${placePhotoName}/media`,
            maxHeightPx: 300,
          },
          {
            otherArgs: {
              headers: {
                "X-Goog-FieldMask": "photoUri",
              },
            },
          },
          (err, media) => {
            if (err) {
              console.error("Error fetching place photo", err);
              return resolve("");
            }

            return resolve(media?.photoUri || "");
          },
        );
      },
    );
  });
}
