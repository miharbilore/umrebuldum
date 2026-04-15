export const sanitizeCityName = (value?: string | null) =>
  value ? value.replace(/\*/g, "").trim() : value;
