<script lang="ts" context="module">
	const SUMMARY_KEYS = [
		'Duration',
		'Pause Time',
		'Distance',
		'Average Pace',
		'Average Heart Rate',
		'Maximum Heart Rate',
		'Average Cadence',
		'Maximum Cadence',
		'Average Speed',
		'Maximum Speed',
		'Average Temperature',
		'Maximum Temperature',
		'Ascent',
		'Descent',
		'Energy',
		'Maximum Altitude',
		'Minimum Altitude',
		'Starting Altitude',
		'End Altitude',
		'Moving time'
	];
</script>

<script lang="ts">
	import type { Summary } from 'nostr-activities-sdk';
	import convert from 'convert';
	import { fromPairs, compact } from 'lodash';

	export let displayUnit: 'metric' | 'imperial' = 'metric';
	export let summary: Partial<Summary>;

	$: displayUnits = fromPairs(
		compact(
			SUMMARY_KEYS.map((key) => {
				if (summary.content[key] !== undefined) {
					return [key, getDisplayUnits(key, summary.content[key], displayUnit) as string];
				}
			})
		)
	);

	const getDisplayUnits = (key: string, value: number, displayUnit: 'metric' | 'imperial') => {
		if (key === 'Duration' || key === 'Pause Time' || key === 'Moving time') {
			const hours = Math.floor(value / 3600);
			const minutes = Math.floor((value % 3600) / 60);
			const seconds = Math.floor(value % 60);
			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
		if (key === 'Distance') {
			return displayUnit === 'metric'
				? convert(value, 'm').to('km').toFixed(2) + ' km'
				: convert(value, 'm').to('mi').toFixed(2) + ' mi';
		}
		if (key === 'Average Pace') {
			const time = displayUnit === 'metric' ? value : value * 1.60934;
			const minutes = Math.floor((time % 3600) / 60);
			const seconds = Math.floor(time % 60);
			const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
			return displayUnit === 'metric' ? `${displayTime} min/km` : `${displayTime} min/mi`;
		}
		if (key.includes('Heart Rate') || key.includes('Cadence')) {
			return value.toFixed(0) + ' bpm';
		}
		if (key.includes('Temperature')) {
			return displayUnit === 'metric'
				? value.toFixed(1) + '°C'
				: convert(value, 'C').to('F').toFixed(1) + '°F';
		}
		if (key.includes('Speed')) {
			return displayUnit === 'metric'
				? `${(value * 3.6).toFixed(2)} kph`
				: `${(value * 2.2369).toFixed(2)} mph`;
		}
		if (
			key.includes('Elevation') ||
			key.includes('Altitude') ||
			key.includes('Ascent') ||
			key.includes('Descent')
		) {
			return displayUnit === 'metric'
				? value.toFixed(0) + ' m'
				: convert(value, 'm').to('ft').toFixed(0) + ' ft';
		}
		if (key === 'Energy') {
			return value.toFixed(0) + `${displayUnit === 'metric' ? ' kcal' : ' cal'}`;
		}
		return value;
	};
</script>

{#if summary.type !== 'sports-lib-summary'}
	<div>Unknown Summary Type</div>
{:else}
	<div class="flex flex-col gap-y-2">
		{#each SUMMARY_KEYS as key}
			{#if summary.content[key] !== undefined}
				<div class="flex justify-between">
					<div>{key}</div>
					<div>{displayUnits[key]}</div>
				</div>
			{/if}
		{/each}
	</div>
{/if}
