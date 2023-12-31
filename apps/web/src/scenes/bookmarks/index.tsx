import { useNavigate } from "react-router-dom";
import LoadingScene from "ui/Loading";

import { useGetBookmarks } from "src/services/api/bookmarks";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

import BookmarkForm from "./components/BookmarkForm";
import BookmarkListItem from "./components/BookmarkListItem";
import DashboardWrap from "src/components/DashboardWrap";

const Recommendations = () => {
  const navigate = useNavigate();
  const user = useAppSelector(getUser);
  const { data, refetch, status: bookmarksStatus } = useGetBookmarks();

  if (!user) {
    navigate("/");
  } else {
    refetch();
  }

  return (
    <DashboardWrap>
      <BookmarkForm onCreate={refetch} />
      <div>
        {bookmarksStatus === "loading" && <LoadingScene />}
        {data?.length === 0 && "your bookmarks will appear here"}
        {data && data.length > 0 && (
          <ul className="space-y-2">
            {data.map((bookmark) => (
              <BookmarkListItem
                key={bookmark.id}
                bookmark={bookmark}
                onDelete={refetch}
              />
            ))}
          </ul>
        )}
      </div>
    </DashboardWrap>
  );
};

export default Recommendations;
