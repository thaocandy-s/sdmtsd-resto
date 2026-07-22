export interface Rule {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Winner {
  id: string;
  participantName: string;
  imageUrl: string | null;
  challengeName: string | null;
  discountAwarded: string | null;
  completedAt: string;
  isPublished: boolean;
}

export type RuleForm = {
  title: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

export type WinnerForm = {
  participantName: string;
  imageUrl: string;
  challengeName: string;
  discountAwarded: string;
  completedAt: string;
  isPublished: boolean;
};

export const emptyRule: RuleForm = {
  title: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

export const emptyWinner: WinnerForm = {
  participantName: "",
  imageUrl: "",
  challengeName: "",
  discountAwarded: "",
  completedAt: new Date().toISOString().split("T")[0],
  isPublished: false,
};
