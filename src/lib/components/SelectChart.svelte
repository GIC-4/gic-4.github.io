<script lang="ts">
	import { darkMode, loadChart } from '$lib/store';
	import { blue, lerpColor, pink } from '$lib/utils';
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import type { ApexOptions } from 'apexcharts';

	interface Props {
		height?: number;
		width?: number;
		onPointSelect?: (point: [number, number]) => void;
		labelX?: string;
		labelY?: string;
	}

	const { height = 800, width = 800, onPointSelect, labelX, labelY }: Props = $props();

	const titleStyle = {
		cssClass: 'text-lg  ',
		color: $darkMode ? 'white' : 'black'
	};

	const labelStyle = {
		cssClass: 'text-lg  ',
		colors: $darkMode ? 'white' : 'black'
	};

	// Minimal scatter plot for 2D selection
	let options = $derived<ApexOptions>({
		chart: {
			type: 'scatter',
			width,
			height,
			toolbar: { show: false },
			zoom: { enabled: false },
			animations: { enabled: true },
			selection: { enabled: false }
		},
		title: { text: '' },
		xaxis: {
			min: 0,
			max: 9,
			tickAmount: 9,
			labels: {
				formatter: (val: string) => {
					const num = parseInt(val);
					if (num === 0) return 'Fem 0';
					if (num === 9) return 'Masc 9';
					return val;
				},
				style: labelStyle
			},
			title: { text: labelX, style: titleStyle }
		},
		yaxis: {
			min: 0,
			max: 9,
			tickAmount: 9,
			labels: {
				formatter: (val: number) => {
					if (val === 0) return 'Minimal 0';
					if (val === 9) return 'High 9';
					return val.toString();
				},
				minWidth: 80,
				style: labelStyle
			},
			title: { text: labelY, style: titleStyle }
		},
		grid: {
			xaxis: { lines: { show: true } },
			yaxis: { lines: { show: true } }
		},
		legend: { show: false },
		dataLabels: { enabled: false },
		markers: { size: 40, colors: ['#00BAEC'] },
		series: [
			{
				name: 'Pick',
				data: []
			}
		],
		tooltip: { enabled: false },
		responsive: [
			{
				breakpoint: 1024, // max-lg
				options: {
					chart: {
						width: 600,
						height: 600
					},
					title: {
						text: ''
					}
				}
			},
			{
				breakpoint: 768, // max-md
				options: {
					chart: {
						width: 500,
						height: 500
					},
					markers: { size: 20, colors: ['#00BAEC'] },
					title: {
						text: ''
					}
				}
			},
			{
				breakpoint: 640, // max-sm
				options: {
					chart: {
						width: 500,
						height: 500
					},
					title: {
						text: labelY,
						floating: true,
						style: { ...titleStyle, cssClass: 'text-md' }
					},
					xaxis: {
						min: 0,
						max: 9,
						tickAmount: 9,
						labels: {
							formatter: (val: string) => {
								const num = parseInt(val);
								if (num === 0) return 'Fem 0';
								if (num === 9) return 'Masc 9';
								return val;
							},
							style: { ...labelStyle, cssClass: 'text-md' }
						},
						title: { text: labelX, style: { ...titleStyle, cssClass: 'text-md' } }
					},
					yaxis: {
						min: 0,
						max: 9,
						tickAmount: 9,
						labels: {
							formatter: (val: number) => {
								if (val === 0) return '0';
								return val.toString();
							},
							style: { ...labelStyle, cssClass: 'text-md' }
						},
						title: { text: '' }
					},
					markers: { size: 10, colors: ['#00BAEC'] }
				}
			},
			{
				breakpoint: 480, // max-sm
				options: {
					chart: {
						width: 300,
						height: 300
					},
					title: {
						text: labelY,
						floating: true,
						style: { ...titleStyle, cssClass: 'text-md' }
					},
					xaxis: {
						min: 0,
						max: 9,
						tickAmount: 9,
						labels: {
							formatter: (val: string) => {
								const num = parseInt(val);
								if (num === 0) return 'Fem 0';
								if (num === 9) return 'Masc 9';
								return val;
							},
							style: { ...labelStyle, cssClass: 'text-md' }
						},
						title: { text: labelX, style: { ...titleStyle, cssClass: 'text-md' } }
					},
					yaxis: {
						min: 0,
						max: 9,
						tickAmount: 9,
						labels: {
							formatter: (val: number) => {
								if (val === 0) return '0';
								return val.toString();
							},
							style: { ...labelStyle, cssClass: 'text-md' }
						},
						title: { text: '' }
					},
					markers: { size: 10, colors: ['#00BAEC'] }
				}
			}
		]
	});

	// Drag state
	let isDragging = $state(false);
	let currentPoint = $state<[number, number] | null>(null);

	$effect(() => {
		if (currentPoint) {
			onPointSelect?.(currentPoint);
			updateChartGradient();
		}
	});

	function getChartCoords(event: MouseEvent): [number, number] | null {
		const chartEl = document.querySelector('.apexcharts-grid');
		if (!chartEl) return null;
		const rect = chartEl.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const chartWidth = rect.width;
		const chartHeight = rect.height;
		let valX = Math.round((x / chartWidth) * 9);
		let valY = Math.round(9 - (y / chartHeight) * 9);
		valX = Math.max(0, Math.min(9, valX));
		valY = Math.max(0, Math.min(9, valY));
		return [valX, valY];
	}

	function handleMouseDown(event: MouseEvent) {
		const coords = getChartCoords(event);
		if (!coords) return;
		isDragging = true;
		currentPoint = coords;
		options = {
			...options,
			series: [{ name: 'Pick', data: [[currentPoint[0], currentPoint[1]]] }]
		};
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging) return;
		const coords = getChartCoords(event);
		if (!coords) return;
		currentPoint = coords;
		options = {
			...options,
			series: [{ name: 'Pick', data: [[currentPoint[0], currentPoint[1]]] }]
		};
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function updateChartGradient() {
		// Pink: #ec4899, Blue: #3b82f6
		let x = currentPoint ? currentPoint[0] : 0;
		let t = x / 9;
		let color = lerpColor(pink, blue, t);
		// More color at top, transparent at bottom
		const gradient = `linear-gradient(to top, rgba(0,0,0,0) 10%, ${color} 100%)
		`;
		// Find .apexcharts-canvas and set background
		const canvas = document.querySelector('.apexcharts-canvas');
		if (canvas) {
			(canvas as HTMLElement).style.background = gradient;
		}
	}

	loadChart.subscribe((points: [number, number] | null) => {
		options = {
			...options,
			series: [
				{
					name: 'Pick',
					data: points ? [points] : []
				}
			]
		};
		isDragging = false;
		currentPoint = points;
	});
</script>

<div
	role="button"
	tabindex="0"
	id="chart-container"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	class="overflow-hidden rounded-2xl border-0 border-gray-200"
>
	<Chart bind:options />
</div>
