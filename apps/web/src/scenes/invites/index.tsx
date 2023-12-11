import { useNavigate } from "react-router-dom";

import DashboardWrap from "src/components/DashboardWrap";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

const Invites = () => {
  const navigate = useNavigate();
  const user = useAppSelector(getUser);

  if (!user) {
    navigate("/");
  }

  return (
    <DashboardWrap>
      <h1>Invites</h1>
    </DashboardWrap>
  );
};

export default Invites;
