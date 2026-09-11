export type AiEntityRecord = {
  type: string;
  id: string;
  label: string;
};

export type AiEntitySource = {
  type: string;
  kindLabel: string;
  boundKindLabel: string;
  searchParam: string;
  list(): Promise<AiEntityRecord[]>;
  find(id: string): Promise<AiEntityRecord | null>;
  open(id: string): void;
};
