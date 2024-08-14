<script lang="ts">
	import { goto } from '$app/navigation';
	import { activitiesStore, units, shareSettings } from '$lib';
	import ActivityMap from '$lib/components/ActivityMap.svelte';
	import ActivityTypeDropdown from '$lib/components/ActivityTypeDropdown.svelte';
	import Summarizer from '$lib/summarizer';
	import type { Feature, LineString } from 'geojson';
	import type { CreateActivityParams, Summary } from 'nostr-activities-sdk';
	import SportsLibSummary from '$lib/components/SportsLibSummary.svelte';

	let fileInput: HTMLInputElement;
	let file: File;
	let summarizer: Summarizer;
	let summary: Partial<Summary>;
	let saving = false;
	let geoJSON: Feature<LineString>;

	let newActivity: CreateActivityParams = {
		title: 'New Activity',
		type: 'run',
		description: ''
	};

	const handleFileUpload = async () => {
		if (!fileInput.files?.[0]) return;
		file = fileInput.files?.[0];
		summarizer = new Summarizer();
		await summarizer.parseFromFile(file);
		const { title, recorded_at, type } = summarizer.getMetadata();
		if (title) {
			newActivity.title = title;
		}
		if (type) {
			newActivity.type = type;
		}
		if (recorded_at) {
			newActivity.recorded_at = recorded_at;
		}
		summary = summarizer.getSummary();
		geoJSON = await summarizer.geoJSONSummary(0);
	};

	const handleSave = async () => {
		saving = true;
		let reference: string | undefined;
		if ($shareSettings.activityFile && file) {
			const blob = await activitiesStore.uploadFile(file);
			reference = blob.url;
		}
		const activity = await activitiesStore.createActivity({
			...newActivity,
			reference_url: reference
		});
		if ($shareSettings.map && geoJSON) {
			const trimmed = await summarizer.geoJSONSummary($shareSettings.trimAmount);
			const geoFile = new File([JSON.stringify(trimmed)], '', { type: 'application/json' });
			const blob = await activitiesStore.uploadFile(geoFile);
			await activitiesStore.createSummary({
				content: blob.url,
				type: 'geojson',
				geohash: await summarizer.getGeohash(),
				reference_ids: [activity.id]
			});
		}
		await activitiesStore.createSummary({
			content: summary.content,
			type: 'sports-lib-summary',
			unit: 'metric',
			reference_ids: [activity.id]
		});
		saving = false;
		goto(`/activities/${activity.id}`);
	};
</script>

<div class="flex flex-col gap-y-2">
	<div class="flex w-full justify-center">
		<label>
			<div class="label">Upload an activity file. Supports (.gpx, .fit, .fit.gz)</div>
			<input
				type="file"
				bind:this={fileInput}
				on:input={handleFileUpload}
				class="file-input file-input-sm file-input-bordered w-full max-w-xs"
			/>
			<div class="label">
				<span class="label-text-alt">
					You can manually enter the activity below if you do not wish to upload a file. You can
					also change statistic generated from the file
				</span>
			</div>
		</label>
	</div>
	<div class="collapse collapse-arrow bg-base-200">
		<input type="checkbox" />
		<div class="collapse-title text-xl font-medium">Sharing Options</div>
		<div class="collapse-content flex flex-col gap-y-2 w-full">
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text">Share Route Map</span>
					<input type="checkbox" bind:checked={$shareSettings.map} class="checkbox" />
				</label>
				<div class="label">
					<span class="label-text-alt">
						If checked, the trimmed route map will be uploaded and associated with this activity
					</span>
				</div>
			</div>
			{#if $shareSettings.map}
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Hide Activity Start / End (Meters)</span>
					</div>
					<input
						type="number"
						min="0"
						bind:value={$shareSettings.trimAmount}
						class="input input-bordered w-full"
					/>
					<div class="label">
						<span class="label-text-alt">
							Trim the first and last {$shareSettings.trimAmount} meters of the activity. This only affects
							the map file that is published. Stats are based on the full file
						</span>
					</div>
				</label>
			{/if}
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text">Share Activity file</span>
					<input type="checkbox" bind:checked={$shareSettings.activityFile} class="checkbox" />
				</label>
				<div class="label">
					<span class="label-text-alt">
						If checked, the activity file will be uploaded and associated with this activity
					</span>
				</div>
			</div>
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text">Encrypt</span>
					<input type="checkbox" disabled checked={false} class="checkbox" />
				</label>
				<div class="label">
					<span class="label-text-alt">
						If checked, all data associated with this activity will be encrypted before upload. (NOT
						YET SUPPORTED)
					</span>
				</div>
			</div>
		</div>
	</div>
	<div class="w-full">
		<h3 class="text-xl font-medium">Activity details</h3>
		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">Title</span>
			</div>
			<input
				type="text"
				bind:value={newActivity.title}
				placeholder="Title"
				class="input input-bordered w-full"
			/>
		</label>
		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">Activity Type</span>
			</div>
			<ActivityTypeDropdown bind:value={newActivity.type} />
		</label>
		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">Description</span>
			</div>
			<textarea
				bind:value={newActivity.description}
				placeholder="Description"
				class="textarea textarea-bordered w-full"
			></textarea>
		</label>
	</div>
	{#if geoJSON}
		<div class="w-full h-full">
			<ActivityMap {geoJSON} />
		</div>
		<span class="text-sm"
			>Your uploaded map will reflect the trimmed version if you have selected to trim</span
		>
	{/if}
	<div class="w-full flex flex-col gap-y-4">
		<div class="w-full pt-6">
			<div class="text-xl font-medium">Activity Summary</div>
			<div class="w-full grid grid-cols-2 gap-4">
				{#if summary}
					<SportsLibSummary {summary} displayUnit={$units} />
				{/if}
			</div>
		</div>
	</div>
	<button class="btn btn-primary" on:click={handleSave}
		>Save Activity
		{#if saving}
			<div class="loading loading-spinner loading-md"></div>
		{/if}
	</button>
</div>
