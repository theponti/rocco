import styled from "@emotion/styled";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeedbackBlock from "ui/FeedbackBlock";

import { LANDING } from "src/constants/routes";
import { useAuth } from "src/services/store";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
`;

function useDeleteUserMutation() {
  return {
    mutateAsync: () => Promise.resolve({ error: Error }),
    error: null,
  };
}

function MemberSince({ createdAt }: { createdAt: string }) {
  const memberSince = new Date(createdAt);
  const timeDiff = new Date().getTime() - memberSince.getTime();
  // Convert milliseconds to years
  const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));

  return (
    <p>{`Member since ${memberSince.getMonth()}/${
      memberSince.getFullYear() + years
    }`}</p>
  );
}

function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync: deleteUser, error } = useDeleteUserMutation();

  const onDelectAccount = async () => {
    await deleteUser();
  };

  useEffect(() => {
    if (!user) {
      navigate(LANDING);
    }
  }, [navigate, user]);

  console.log({ user });
  if (!user) {
    return null;
  }

  return (
    <Wrap>
      <div className="col-span-12">
        <h1>Account</h1>
        <div className="card shadow-md md:max-w-sm">
          <div className="card-body">
            {user.avatar && (
              <img
                src={user.avatar}
                alt="user avatar"
                className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
              />
            )}
            <p className="text-lg">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <MemberSince createdAt={user.createdAt} />
          </div>
        </div>
        <div className="flex flex-col mb-12"></div>

        <div className="divider" />

        {error && <FeedbackBlock type="error">{error.message}</FeedbackBlock>}

        <button className="btn btn-ghost text-error" onClick={onDelectAccount}>
          Delete account
        </button>
      </div>
    </Wrap>
  );
}

export default Account;
