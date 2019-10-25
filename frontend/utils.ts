// BSD LICENSE - c John Nunley and Larson Rivera

// utilities used by both frontend and backend

export async function timeout(ms: number): Promise<void> {
  return new Promise((resolve: any, reject: any) => {
    setTimeout(function() { resolve(); }, ms);
  });
}

export type Nullable<T> = T | null;

export const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function isFieldEmpty(field: HTMLInputElement): boolean {
  return !(field.value.trim().length > 0);
}
