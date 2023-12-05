import styled from "@emotion/styled";
import { useState } from "react";
import { useAddLocationToList } from "src/services/api/locations";
import { List } from "src/services/types";

const ListItem = styled.li`
  padding: 8px;
  border: 1px solid;
  border-radius: 4px;
`;

const Checkbox = styled.label`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
`;
const AddPlaceToList = ({
  lists,
  place,
}: {
  lists: List[];
  place: google.maps.places.PlaceResult;
}) => {
  const [listIds, setListIds] = useState<string[]>([]);
  const { mutate: addToList } = useAddLocationToList({
    onSuccess: () => {
      // onModalClose();
    },
  });

  const onAddToList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    addToList({
      listIds,
      place,
    });
  };

  const onListSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListIds([...listIds, e.target.value]);
  };

  // List of lists displaying their name and a round checkbox that when clicked adds the list to the listIds array
  return (
    <ul className="list-none mt-8">
      {lists.map((list) => (
        <ListItem key={list.id}>
          <Checkbox htmlFor={list.id}>
            <input
              type="checkbox"
              id={list.id}
              value={list.id}
              onChange={onListSelectChange}
            />
            {list.name}
          </Checkbox>
        </ListItem>
      ))}
      <button
        className="btn btn-primary float-right mt-4"
        onClick={onAddToList}
      >
        Add to list
      </button>
    </ul>
  );
};

export default AddPlaceToList;
