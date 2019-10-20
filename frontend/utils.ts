// BSD LICENSE - c John Nunley and Larson Rivera

export async function timeout(ms: number): Promise<void> {
  return new Promise((resolve: any, reject: any) => {
    setTimeout(function() { resolve(); }, ms);
  });
}

export type Nullable<T> = T | null;
