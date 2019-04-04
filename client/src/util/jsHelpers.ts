export const isNullOrWhiteSpace = (value: string) => !value || !value.trim();

export const notNullOrUndefined = (value: any) => !!value || value === 0