export interface Field {
  name: string;
  type: string;
  hasConnections?: boolean;
}

export type Model = {
  name: string;
  fields: Field[];
  isChild?: boolean;
};

export type ModelConnection = {
  target: string;
  source: string;
  name: string;
};
