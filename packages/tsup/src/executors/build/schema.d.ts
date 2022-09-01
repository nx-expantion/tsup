export interface BuildExecutorSchema {
  entry: Entry;
  outputPath: string;
  tsConfig?: string;
  tsupConfig: string;
  assets: Asset[];
  clean: boolean;
}

export type Entry = string[] | Record<string, string>;

export type Asset =
  | string
  | {
      glob: string;
      input: string;
      output: string;
      ignore: string[];
    };
