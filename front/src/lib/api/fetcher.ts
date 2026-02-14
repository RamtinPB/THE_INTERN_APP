import { authenticatedFetch } from "./auth";

export default async function apiFetch(url: string, options: any = {}) {
	return authenticatedFetch(url, options);
}
