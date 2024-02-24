import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { places_v1 } from "googleapis";

import { SessionToken } from "../../typings";

import { verifySession } from "../auth";
import {
  getPlaceDetails,
  getPlaceMedia,
  places as placesClient,
} from "../google/places";

const PlacesPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.get(
    "/places",
    {
      preValidation: verifySession,
    },
    async (request, reply) => {
      try {
        const places = await server.prisma.place.findMany();
        return reply.code(200).send(places);
      } catch (err) {
        request.log.info("Could not fetch places", err);
        return reply.code(500).send();
      }
    },
  );

  server.get(
    "/places/:id",
    {
      preValidation: verifySession,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = request.session.get("data") as SessionToken;
      const { id } = request.params as { id: string };

      try {
        const place = await server.prisma.place.findFirst({
          where: { googleMapsId: id },
        });

        if (!place) {
          const googlePlace = await getPlaceDetails({
            placeId: id,
            fields: [
              "formatted_address",
              "name",
              "latitude",
              "longitude",
              "types",
              "website",
              "photos",
              "place_id",
              "rating",
              "price_level",
              "international_phone_number",
              "geometry",
              "place_id",
            ],
          });

          if (!googlePlace) {
            return reply.code(404).send();
          }

          const getPlaceName = (
            place: places_v1.Schema$GoogleMapsPlacesV1Place,
          ) => {
            if (place.name) return place.name;
            if (place.adrFormatAddress) return place.adrFormatAddress;
            return "Unknown";
          };

          const photos = googlePlace.photos
            ? await Promise.all(
                googlePlace.photos.map((photo) => getPlaceMedia(photo)),
              )
            : [];

          const newPlace = await server.prisma.place.create({
            data: {
              address: googlePlace.adrFormatAddress,
              name: getPlaceName(googlePlace),
              lat: `${googlePlace.location?.latitude}`,
              lng: `${googlePlace.location?.longitude}`,
              googleMapsId: googlePlace.id,
              imageUrl: photos[0].imageUrl,
              phoneNumber: googlePlace.internationalPhoneNumber,
              types: googlePlace.types || [],
              websiteUri: googlePlace.websiteUri,
              createdBy: {
                connect: {
                  id: session.userId,
                },
              },
            },
          });

          return newPlace;
        }

        return reply.code(200).send(place);
      } catch (err) {
        request.log.info("Could not fetch place", err);
        return reply.code(500).send();
      }
    },
  );

  server.get(
    "/places/search",
    {
      preValidation: verifySession,
      schema: {
        querystring: {
          type: "object",
          properties: {
            query: { type: "string" },
            latitude: { type: "number" },
            longitude: { type: "number" },
            radius: { type: "number" },
          },
          required: ["query", "latitude", "longitude", "radius"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { query, latitude, longitude, radius } = request.query as {
        query: string;
        latitude: number;
        longitude: number;
        radius: number;
      };

      try {
        const response = await placesClient.searchText({
          requestBody: {
            textQuery: query,
            locationBias: {
              circle: {
                radius: radius,
                center: {
                  latitude,
                  longitude,
                },
              },
            },
            maxResultCount: 10,
          },
          fields: [
            "places.name",
            "places.formattedAddress",
            "places.accessibilityOptions",
            "places.addressComponents",
            "places.adrFormatAddress",
            "places.businessStatus",
            "places.displayName",
            "places.formattedAddress",
            "places.googleMapsUri",
            "places.iconBackgroundColor",
            "places.iconMaskBaseUri",
            "places.location",
            "places.photos",
            "places.plusCode",
            "places.primaryType",
            "places.primaryTypeDisplayName",
            "places.shortFormattedAddress",
            "places.subDestinations",
            "places.types",
            "places.utcOffsetMinutes",
            "places.viewport",
          ].join(","),
        });

        const places = response.data as {
          places: places_v1.Schema$GoogleMapsPlacesV1Place[];
        };

        if (!places) {
          return reply.code(404).send();
        }

        return reply.code(200).send(places);
      } catch (err) {
        console.log(err);
        request.log.info("Could not fetch places", err);
        return reply.code(500).send();
      }
    },
  );
};

export default PlacesPlugin;
