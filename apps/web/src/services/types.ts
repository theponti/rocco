interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Idea extends BaseModel {
  description: string;
}

export interface List extends BaseModel {
  name: string;
}

export interface ListInvite extends BaseModel {
  listId: string;
  accepted: boolean;
}

export interface Recommendation extends BaseModel {
  image: string;
  title: string;
  siteName: string;
  url: string;
}

export interface UserLists extends BaseModel {}
