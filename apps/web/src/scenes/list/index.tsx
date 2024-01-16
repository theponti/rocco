import { TrashIcon } from "@radix-ui/react-icons";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "react-query";

import AlertError from "ui/AlertError";
import UserPlus from "ui/Icons/UserPlus";
import LoadingScene from "ui/Loading";

import DashboardWrap from "src/components/DashboardWrap";
import PlaceTypes from "src/components/places/PlaceTypes";
import api, { ListPlace, useGetList } from "src/services/api";
import { useAppDispatch, useAppSelector } from "src/services/hooks";
import { getUser, openPlaceModal } from "src/services/store";
import { baseURL } from "src/services/api/base";

function usePlacesService() {
  const placesLibrary = useMapsLibrary("places");
  const [placesService, setPlacesService] = useState(null);

  useEffect(() => {
    if (!placesLibrary) return;

    setPlacesService(
      new placesLibrary.PlacesService(document.createElement("div")),
    );
  }, [placesLibrary]);

  return placesService;
}

const ListItem = ({
  listId,
  onDelete,
  place,
}: {
  listId: string;
  onDelete: () => void;
  place: ListPlace;
}) => {
  const dispatch = useAppDispatch();
  const placesService = usePlacesService();
  const { mutateAsync } = useMutation({
    mutationKey: ["deleteListItem", listId, place.id],
    mutationFn: () =>
      api.delete(`${baseURL}/lists/${listId}/place/${place.itemId}`),
    onSuccess: () => {
      onDelete();
    },
  });

  const onDeleteClick = async (e: React.MouseEvent) => {
    if (e.button !== 0) {
      return;
    }

    await mutateAsync();
  };

  const onDeleteKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      await mutateAsync();
    }
  };

  const onPlaceNameClick = (e) => {
    e.preventDefault();
    if (!placesService) return;
    placesService.getDetails({ placeId: place.googleMapsId }, (res) => {
      if (!res) return;
      dispatch(openPlaceModal({ place: res }));
    });
  };

  return (
    <div className="card p-2 py-3 rounded-md flex flex-row text-primary mb-10 border-2 glass">
      <div className="flex flex-col flex-1">
        <Link
          to="#"
          className="mb-2 text-lg font-semibold uppercase justify-start underline-offset-4 focus-visible:underline focus-visible:outline-none"
          onClick={onPlaceNameClick}
        >
          {place.name}
        </Link>
        <PlaceTypes types={place.types} />
      </div>
      <button
        data-testid="delete-place-button"
        className="flex items-center px-4 rounded-md hover:cursor-pointer hover:bg-neutral-content hover:bg-opacity-10 focus:bg-neutral-content focus:bg-opacity-10 transition-colors"
        onClick={onDeleteClick}
        onKeyDown={onDeleteKeyDown}
      >
        <TrashIcon width={24} height={24} className="text-red-500" />
      </button>
    </div>
  );
};

const List = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const user = useAppSelector(getUser);
  const listId = params.id;
  const { data, refetch, status: listStatus } = useGetList(listId);

  if (!user) {
    navigate("/");
    return null;
  }

  if (listStatus === "loading") {
    return <LoadingScene />;
  }

  return (
    <DashboardWrap>
      {!data && <AlertError error="We could not find this list." />}
      {data && (
        <div className="flex flex-col px-0.5">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold">{data.name}</h1>
            {/* Only list owners can invite others. */}
            {data.userId === user.id && (
              <Link
                to={`/lists/${data.id}/invites`}
                className="flex gap-2 btn btn-primary text-white"
              >
                <span className="hover:cursor-pointer">
                  <UserPlus />
                </span>
                Invite others
              </Link>
            )}
          </div>
          {data.items.map((place) => (
            <ListItem
              key={place.id}
              listId={data.id}
              place={place}
              onDelete={refetch}
            />
          ))}
        </div>
      )}
    </DashboardWrap>
  );
};

export default List;
