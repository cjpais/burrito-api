export type BurritoQueryParams = {
  query: string;
  schema?: any;
  cacheFor?: number;
  force?: boolean;
};

export type BurritoTransformRequestParams = {
  hashes?: string[];
  prompt: string;
  systemPrompt?: string;
  model?: "gpt4" | "gpt3.5" | "mistral7b" | "mixtral";
  mode?: "each" | "all";
  completionType?: "json" | "text";
  save?: {
    app: string;
    key: string;
  };
  force?: boolean;
};

type TransformPart = {
  hash: string;
  completion: any;
};
type BurritoTransformResponse = TransformPart[];

export class Burrito {
  private baseUrl: string;
  private apiKey: string;
  private fetchFunc: typeof fetch;

  constructor({
    baseUrl,
    apiKey,
    fetchFunc,
  }: {
    baseUrl?: string;
    apiKey?: string;
    fetchFunc?: typeof fetch;
  }) {
    // Ensure environment variables are set
    if (!baseUrl && !process.env.BURRITO_URL) {
      throw new Error(
        "Environment variable BURRITO_URL must be set or passed in"
      );
    }

    if (!apiKey && !process.env.BURRITO_KEY) {
      throw new Error(
        "Environment variable BURRITO_KEY must be set or passed in"
      );
    }

    this.baseUrl = baseUrl ? baseUrl : process.env.BURRITO_URL!;
    this.apiKey = apiKey ? apiKey : process.env.BURRITO_KEY!;
    this.fetchFunc = fetchFunc ? fetchFunc : fetch;
  }

  private async fetcher(url: string, body: any) {
    return await this.fetchFunc(`${this.baseUrl}/${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));
  }

  public async query<T>(query: BurritoQueryParams) {
    const data = await this.fetcher("query", query).then(
      (d: any) => d.data as T
    );

    return data;
  }

  public async queryData<T>(query: BurritoQueryParams) {
    const data = await this.fetcher("query/data", query);
    return data as T;
  }

  public async transform<T>(query: BurritoTransformRequestParams) {
    const data = (await this.fetcher(
      "transform",
      query
    )) as BurritoTransformResponse;

    return data;
  }
}
