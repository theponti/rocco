import { useNavigate } from "react-router-dom";
import PlaceTypes from "src/components/places/PlaceTypes";
import { ListPlace } from "src/services/api";
import { usePlacesService } from "src/services/places";

const ListItem = ({ place }: { place: ListPlace }) => {
  const placesService = usePlacesService();
  const navigate = useNavigate();
  const onPlaceNameClick = async (e) => {
    e.preventDefault();
    if (!placesService) return;

    navigator.vibrate?.(10);

    navigate(`/place/${place.googleMapsId}`);
    // openPlaceModal({
    //   place: await placesService.getPlace({
    //     googleMapsId: place.googleMapsId,
    //   }),
    // });
  };

  return (
    <button
      className="flex card rounded-lg size-full"
      onClick={onPlaceNameClick}
    >
      <div className="rounded-lg p-[2px] border border-slate-200 w-full h-[200px]">
        <img
          src={place.imageUrl}
          alt={place.name}
          className="rounded-lg object-cover w-full h-full"
        />
      </div>
      <div className="flex flex-col flex-1 mt-1 pl-1 h-full justify-between text-wrap break-words">
        <p className="flex-1 mb-1 font-semibold justify-start underline-offset-4 focus-visible:underline focus-visible:outline-none">
          {place.name}
        </p>
        <PlaceTypes types={place.types} />
      </div>
    </button>
  );
};

export default ListItem;
