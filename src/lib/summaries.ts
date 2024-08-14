import type { CreateSummaryParams } from "nostr-activities-sdk";

export interface GeoJSONSummary {
	type: "geojson-summary";
	payload: string; // Location of the geojson file
}
export const createGeoJSONSummary = (location: string, activityId: string) => {
	return {
		reference_ids: [activityId],
		type: "geojson-summary",
		content: location,
	} satisfies CreateSummaryParams;
};
