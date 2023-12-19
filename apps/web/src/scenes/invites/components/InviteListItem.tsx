import { useCallback } from "react";
import { useMutation } from "react-query";
import { baseURL } from "src/services/api/base";
import { ListInvite } from "src/services/types";

type InviteListItemProps = {
  listInvite: ListInvite;
  onAccept: () => void;
};
const InviteListItem = ({ listInvite, onAccept }: InviteListItemProps) => {
  const { accepted, list } = listInvite;
  const { mutate, isLoading } = useMutation(
    () =>
      fetch(`${baseURL}/invites/${listInvite.id}/accept`, {
        method: "POST",
      }),
    {
      onSuccess: () => {
        onAccept();
      },
    },
  );

  const onAcceptClick = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <li className="card shadow-md p-4 text-lg flex flex-row items-center justify-between border border-red-100">
      <p className="text-lg font-semibod text-gray-400">{list.name}</p>
      {accepted ? (
        <span className="text-sm">✅ Accepted</span>
      ) : (
        <span className="text-sm">⏳ Pending</span>
      )}
      <button
        className="btn btn-primary btn-sm"
        disabled={isLoading}
        onClick={onAcceptClick}
      >
        Accept
      </button>
    </li>
  );
};

export default InviteListItem;
