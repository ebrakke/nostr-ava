<script lang="ts">
	import type { Feature, LineString } from 'geojson';
	import { PUBLIC_MAPBOX_API_TOKEN } from '$env/static/public';
	import mapboxgl from 'mapbox-gl';
	import { center } from '@turf/turf';
	import { last } from 'lodash';
	import { onMount } from 'svelte';
	const id = Math.random();
	mapboxgl.accessToken = PUBLIC_MAPBOX_API_TOKEN;

	export let geoJSON: Feature<LineString>;

	$: [startLng, startLat] = geoJSON.geometry.coordinates[0];
	$: [finishLng, finishLat] = last(geoJSON.geometry.coordinates)!;
	$: centerPoint = center(geoJSON);
	$: [centerLng, centerLat] = centerPoint.geometry.coordinates;

	onMount(() => {
		const map = new mapboxgl.Map({
			container: id.toString(), // container ID
			style: 'mapbox://styles/mapbox/light-v11', // style URL
			center: [centerLng, centerLat], // starting position [lng, lat]
			zoom: 12 // starting zoom
		});
		const startMarker = new mapboxgl.Marker().setLngLat([startLng, startLat]);
		const finishMarker = new mapboxgl.Marker().setLngLat([finishLng, finishLat]);
		startMarker.addTo(map);
		finishMarker.addTo(map);
		map.on('load', () => {
			map.addSource('route', {
				type: 'geojson',
				data: geoJSON
			});
			map.addLayer({
				id: 'route',
				type: 'line',
				source: 'route',
				layout: {
					'line-join': 'round',
					'line-cap': 'round'
				},
				paint: {
					'line-color': 'orange',
					'line-width': 4
				}
			});
			map.resize();
		});
	});
</script>

<svelte:head>
	<link href="https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.css" rel="stylesheet" />
</svelte:head>
<div class="w-[500px] h-[300px]" id={id.toString()}></div>
