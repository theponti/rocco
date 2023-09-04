export interface Idea {
  id: string;
}

export interface List {
  id: string;
  name: string;
}

export interface ListInvite {
  id: string;
  listId: string;
  accepted: boolean;
}

export interface Recommendation {
  id: string;
  image: string;
  title: string;
  siteName: string;
  url: string;
}

export interface UserLists {
  id: string;
}
