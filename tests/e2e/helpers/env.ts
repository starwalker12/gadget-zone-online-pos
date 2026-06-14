export const ENV = {
  baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
  email: process.env.PLAYWRIGHT_TEST_EMAIL || "",
  password: process.env.PLAYWRIGHT_TEST_PASSWORD || "",
  allowProductionMutations: process.env.PLAYWRIGHT_ALLOW_PRODUCTION_MUTATIONS === "true",
};

export function hasCredentials(): boolean {
  return !!(ENV.email && ENV.password);
}

export function isProductionBaseUrl(): boolean {
  const url = ENV.baseURL.toLowerCase();
  return (
    url.includes("saledock.site") ||
    url.includes("saledock-cloud-pos.vercel.app")
  );
}

export function allowProductionMutations(): boolean {
  if (isProductionBaseUrl()) {
    return ENV.allowProductionMutations;
  }
  return true;
}
