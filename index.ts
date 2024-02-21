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

export type BurritoData = {
  hash?: string;
  created?: number;
  date?: string;
  title?: string;
  summary?: string;
  description?: string;
  caption?: string;
  text?: string;
  // TODO should add userData and location
};

export type BurritoEmbeddingsData = {
  hash: string;
  distance: number;
  type: string;
  created: number;
  summary?: string;
  title?: string;
  description?: string;
};

export type BurritoEmbeddingsRequest = {
  vectors?: number[][];
  queries?: string[];
  num?: number;
};

export type TransformPart<T> = {
  hash: string;
  completion: T;
};
export type BurritoTransformResponse<T = any> = TransformPart<T>[];

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

  private async fetcher(url: string, body: any, init?: RequestInit | any) {
    return await this.fetchFunc(`${this.baseUrl}/${url}`, {
      ...init,
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

  public async query<T = BurritoData>(
    query: BurritoQueryParams,
    init?: RequestInit | any
  ) {
    const data = await this.fetcher("query", query, init).then((d: any) =>
      d.data ? (d.data as T) : (d as T)
    );

    return data;
  }

  public async queryData<T>(
    query: BurritoQueryParams,
    init?: RequestInit | any
  ) {
    const data = await this.fetcher("query/data", query, init);
    return data as T;
  }

  public async queryEmbeddings(
    query: BurritoEmbeddingsRequest,
    init?: RequestInit | any
  ) {
    return (await this.fetcher(
      "query/embeddings",
      query,
      init
    )) as BurritoEmbeddingsData[];
  }

  public async transform<T = any>(
    query: BurritoTransformRequestParams & { mode: "all" },
    init?: RequestInit | any
  ): Promise<T>;

  public async transform<T = any>(
    query: BurritoTransformRequestParams & { mode: "each" },
    init?: RequestInit | any
  ): Promise<BurritoTransformResponse<T>>;

  public async transform<T = any>(
    query: BurritoTransformRequestParams,
    init?: RequestInit | any
  ) {
    const data = await this.fetcher("transform", query, init);

    if (query.mode === "each") return data as BurritoTransformResponse<T>;
    return data as T;
  }
}
