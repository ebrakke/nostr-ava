import { along, center, lineSlice, lineString } from "@turf/turf";
import Geohash from "latlon-geohash";
import { SportsLib } from "@sports-alliance/sports-lib";
import { EventExporterGPX } from "@sports-alliance/sports-lib/lib/events/adapters/exporters/exporter.gpx";
import type { EventInterface } from "@sports-alliance/sports-lib/lib/events/event.interface";
import GpxParser from "gpxparser";
import { parseActivityType, type Summary } from "nostr-activities-sdk";
import type { Feature, LineString } from "geojson";

interface SummarizerOptions {
	distanceUnit?: "miles" | "kilometers" | "meters" | "feet";
	elevationUnit?: "meters" | "feet";
	paceUnit?: "min/km" | "min/mi";
}

export default class Summarizer {
	gpxData: string = "";
	event: EventInterface | null = null;
	options: SummarizerOptions;
	constructor(opts?: SummarizerOptions) {
		this.options = {
			distanceUnit: "miles",
			elevationUnit: "feet",
			paceUnit: "min/mi",
			...opts,
		};
	}

	async parseFromFile(file: File) {
		const [, ext, gz] = file.name.split(".");

		// Uncompress the file
		if (gz === "gz" && ext === "fit") {
			const ds = new DecompressionStream("gzip");
			const decompressedStream = file.stream().pipeThrough(ds);
			const blob = await new Response(decompressedStream).blob();
			await this.parseFromFit(new File([blob], file.name));
			return;
		}
		if (gz === "gz" && ext === "tcx") {
			const ds = new DecompressionStream("gzip");
			const decompressedStream = file.stream().pipeThrough(ds);
			const text = await new Response(decompressedStream).text();
			await this.parseFromTCX(text);
			return;
		}
		if (ext === "fit" && !gz) {
			await this.parseFromFit(file);
			return;
		}
		if (ext === "gpx") {
			await this.parseGpx(await file.text());
			return;
		}
		throw new Error(
			"Unrecognized file type. Only GPX and FIT files are supported.",
		);
	}

	async parseGpx(data: string) {
		const event = await SportsLib.importFromGPX(data);
		this.event = event;
	}

	async parseFromFit(file: File) {
		const event = await SportsLib.importFromFit(await file.arrayBuffer());
		this.event = event;
	}

	async parseFromTCX(data: string) {
		const parser = new DOMParser();
		const parsed = parser.parseFromString(data.trim(), "application/xml");
		const event = await SportsLib.importFromTCX(parsed);
		this.event = event;
	}

	getMetadata() {
		if (!this.event) {
			throw new Error("No event found");
		}
		return {
			type: parseActivityType(this.event.getActivityTypesAsString()),
			title: this.event.getFirstActivity()?.name || this.event.name,
			recorded_at: Math.floor(this.event.startDate.getTime() / 1000),
		};
	}

	getSummary(): Partial<Summary> {
		if (!this.event) {
			throw new Error("No event found");
		}
		const stats = this.event.toJSON().stats;
		// Clean up some doxxing stats
		delete stats["Start Position"];
		delete stats["End Position"];

		return {
			type: "sports-lib-summary",
			unit: "metric",
			content: stats,
		};
	}

	async getGeohash() {
		if (!this.event) {
			throw new Error("No event found");
		}
		const geoSummary = await this.geoJSONSummary();
		const centerOfRoute = center(geoSummary);
		const geohash = Geohash.encode(
			centerOfRoute.geometry.coordinates[1],
			centerOfRoute.geometry.coordinates[0],
			9,
		);
		return geohash;
	}

	async geoJSONSummary(trimStartAndEndTolerance = 200) {
		if (!this.event) {
			throw new Error("No event found");
		}
		const gpxParser = new GpxParser();
		const gpx = await new EventExporterGPX().getAsString(this.event);
		gpxParser.parse(gpx);
		const ls = lineString(
			gpxParser.tracks[0].points.map((p) => [p.lon, p.lat]),
		);
		if (trimStartAndEndTolerance > 0) {
			const newStart = along(ls, trimStartAndEndTolerance, { units: "meters" });
			const newEnd = along(reverseLineString(ls), trimStartAndEndTolerance, {
				units: "meters",
			});
			return lineSlice(newStart, newEnd, ls);
		}

		return ls;
	}
}

function reverseLineString(line: Feature<LineString>) {
	return lineString([...line.geometry.coordinates].reverse());
}
