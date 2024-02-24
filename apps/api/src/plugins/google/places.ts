import { writeFile } from "fs";
import * as path from "path";
import { google } from "./auth";
import { places_v1 } from "googleapis";

export const { places } = google.places("v1");

export async function getPlaceDetails({
  placeId,
}: {
  placeId: string;
  fields: string[];
}) {
  const response = await places.get({
    name: `places/${placeId}`,
    fields: "formatted_address,photos",
  });

  return response.data;
}

export const isValidImageUrl = (url: string) => {
  return (
    !!url && typeof url === "string" && url.indexOf("googleusercontent") !== -1
  );
};

export const getPlacePhotos = async ({
  googleMapsId,
  placeId,
  limit,
}: {
  googleMapsId: string;
  limit?: number;
  placeId: string;
}) => {
  const { data } = await places.get({
    name: `places/${googleMapsId}`,
    fields: "photos",
  });

  if (!data) {
    console.error("Error fetching place", { placeId });
    return;
  }

  const { photos } = data;

  if (!photos) {
    console.error("No photos found for place", { placeId });
    return;
  }

  return Promise.all(
    photos.slice(0, limit).map((photo) => getPlaceMedia(photo)),
  );
};

export async function getPlaceMedia(
  photo: places_v1.Schema$GoogleMapsPlacesV1Photo,
) {
  const media = await places.photos.getMedia({
    name: `${photo.name}/media`,
    maxHeightPx: 300,
  });

  let imageUrl = media.request.responseURL;

  return {
    blob: media.data,
    imageUrl: isValidImageUrl(imageUrl) ? imageUrl : null,
  };
}

export const downloadPlacePhotBlob = async (blob: Blob, filename: string) => {
  const buffer = await blob.arrayBuffer();
  const bufferData = Buffer.from(buffer);
  const filePath = path.resolve(__dirname, `./public/${filename}.jpg`);

  await new Promise<void>((res, rej) =>
    writeFile(filePath, bufferData, (err) => {
      if (err) {
        console.error("Error writing file", err);
        rej(err);
      }
      res();
    }),
  );
};
export const downloadPlacePhotos = async ({
  googleMapsId,
  placeId,
}: {
  googleMapsId: string;
  placeId: string;
}) => {
  if (googleMapsId) {
    const photos = await getPlacePhotos({
      googleMapsId,
      placeId,
    });

    if (photos) {
      await Promise.all(
        photos.map(async (photo, index) => {
          return (
            photo.blob &&
            downloadPlacePhotBlob(photo.blob as Blob, `${placeId}-${index}`)
          );
        }),
      );
    }
  }
};
