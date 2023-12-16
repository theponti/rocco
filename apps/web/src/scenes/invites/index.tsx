import { useNavigate } from "react-router-dom";

import DashboardWrap from "src/components/DashboardWrap";
import { useGetInvites } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

const Invites = () => {
  const navigate = useNavigate();
  const user = useAppSelector(getUser);
  const { data: invites } = useGetInvites();
  if (!user) {
    navigate("/");
  }

  return (
    <DashboardWrap>
      <h1>Invites</h1>
      {invites && (
        <ul>
          {invites.map(({ listId, list }) => (
            <li key={listId}>
              <span>{list.name}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardWrap>
  );
};

export default Invites;
