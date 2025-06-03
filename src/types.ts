export interface Structure {
  [key: string]: string | null;
}
export type Callback = (error?: NodeJS.ErrnoException) => undefined;
