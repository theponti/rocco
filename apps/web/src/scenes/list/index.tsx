import { Link, useNavigate, useParams } from "react-router-dom";

import AlertError from "ui/AlertError";
import UserPlus from "ui/Icons/UserPlus";
import LoadingScene from "ui/Loading";

import DashboardWrap from "src/components/DashboardWrap";
import { useGetList } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

const List = () => {
  const navigate = useNavigate();
  const params = useParams();
  const user = useAppSelector(getUser);
  const listId = params.id as string;
  const { data, status: listStatus } = useGetList(listId);

  if (!user) {
    navigate("/");
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
            <h1 className="text-3xl font-semibold text-white">{data.name}</h1>
            {/* Only list owners can invite others. */}
            {data.userId === user.id && (
              <Link
                to={`/lists/${data.id}/invites`}
                className="flex gap-2 text-primary btn btn-sm btn-neutral"
              >
                Invite others
                <span className="text-lg hover:cursor-pointer">
                  <UserPlus />
                </span>
              </Link>
            )}
          </div>
          {data.items.map((place) => (
            <div
              key={place.id}
              className="card p-2 py-3 rounded-md flex flex-col bg-neutral text-primary mb-10"
            >
              <span className="mb-2 text-lg font-semibold uppercase">
                {place.name}
              </span>
              <div className="flex gap-2">
                {place.types.map((type) => (
                  <span
                    key={type}
                    className="bg-black rounded px-2 py-1 text-white text-xs capitalize"
                  >
                    {type.replace(/_/gi, " ")}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardWrap>
  );
};

export default List;
