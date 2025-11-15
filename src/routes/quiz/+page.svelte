<script lang="ts">
	import { goto } from '$app/navigation';
	import SelectChart from '$lib/components/SelectChart.svelte';
	import { loadChart } from '$lib/store';
	import type { GIC4Segment, GICDigits } from '$lib/types';
	import {
		blue,
		formatSegment,
		formatSegments,
		getSegmentMeaning,
		lerpColor,
		pink
	} from '$lib/utils';
	import { Badge, Button, Card, Heading, P, Range, StepIndicator, Toggle } from 'flowbite-svelte';

	let currentStep = $state(1);
	let omitX = $state(false);
	let omitY = $state(false);
	let slideX = $state<number | undefined>(undefined);
	let slideY = $state<number | undefined>(undefined);

	let steps = [
		{
			name: 'Step 1: Overall/Psychological',
			title: "What's your overall/psychological gender expression?"
		},
		{
			name: 'Step 2: Chest',
			title: "What's your chest/breasts expression?"
		},
		{
			name: 'Step 3: Genital(s)',
			title: "What's your genital(s) expression?"
		},
		{
			name: 'Step 4: Skin/Body Hair',
			title: "What's your skin/body hair gender expression?",
			labelX: 'Skin Softness',
			labelY: 'Skin Hairiness',
			disableOmit: true
		}
	];
	const SIZE = 800;

	// 0-3 low, 4-6 medium, 7-9 high

	let selectedPoint = $state<GIC4Segment | undefined>(undefined);

	let selections = $state<(GIC4Segment | undefined)[]>(Array.from({ length: 4 }, () => undefined));

	let currentSegment = $derived.by<[GICDigits, GICDigits] | undefined>(() => {
		let x: GICDigits | undefined;
		let y: GICDigits | undefined;

		if (omitX && !omitY) {
			x = null;
			y = slideY as GICDigits;
		} else if (!omitX && omitY) {
			x = slideX as GICDigits;
			y = null;
		} else if (!omitX && !omitY) {
			x = selectedPoint?.[0];
			y = selectedPoint?.[1];
		} else {
			x = null;
			y = null;
		}
		return x === undefined || y === undefined ? undefined : [x, y];
	});

	let badgeColor = $derived.by(() => {
		if (currentSegment) {
			// p[0] controls color, p[1] controls alpha
			const x = currentSegment[0] === null ? 9 : (currentSegment[0] ?? 0);
			const y = currentSegment[1] === null ? 9 : (currentSegment[1] ?? 0);

			const alpha = Math.max(0, Math.min(1, y / 9));
			const { r, g, b } = lerpColor(pink, blue, x / 9);
			return `rgba(${r},${g},${b},${alpha})`;
		} else return 'rgba(0,0,0,0)';
	});

	function onPointSelect(point: [number, number]) {
		selectedPoint = point as GIC4Segment;
	}

	function loadStep(i: number) {
		currentStep = i;
		const prevSelection = selections[currentStep - 1];
		omitX = prevSelection?.[0] === null;
		omitY = prevSelection?.[1] === null;
		slideX = prevSelection?.[0] ?? undefined;
		slideY = prevSelection?.[1] ?? undefined;

		if (!omitX && !omitY) {
			loadChart.set(prevSelection as [number, number]);
			selectedPoint = prevSelection;
		}
	}

	function onNext() {
		if (selections[currentStep]) {
			currentStep += 1;
			loadStep(currentStep);
		} else {
			if (currentSegment) {
				selections[currentStep - 1] = currentSegment;
				// Trigger loadChart event
				loadChart.set([0, 0]);
				loadChart.set(null);
				selectedPoint = undefined;
				omitX = false;
				omitY = false;
				slideX = undefined;
				slideY = undefined;
				if (currentStep != steps.length) {
					currentStep += 1;
				} else {
					goto('./?code=' + formatSegments(selections as GIC4Segment[]));
				}
			}
		}
	}
	function onBack() {
		loadStep(currentStep - 1);
	}
</script>

<div class="mx-auto my-8 max-w-5xl space-y-8">
	<StepIndicator {currentStep} steps={steps.map((x) => x.name)} />

	<Card
		class="
    max-w-[96rem] p-4
    sm:p-5
    md:p-7
  "
		size="xl"
	>
		<div class="mx-auto space-y-8">
			<Heading
				tag="h2"
				class="
      text-center text-xl
      md:text-4xl
    ">{steps[currentStep - 1].title}</Heading
			>
			{#if !omitX && !omitY}
				<SelectChart
					height={SIZE}
					width={SIZE}
					{onPointSelect}
					labelX={steps[currentStep - 1].labelX || 'Fem <-> Masc'}
					labelY={steps[currentStep - 1].labelY || 'Intensity'}
				/>
			{:else if omitX && !omitY && !steps[currentStep - 1].disableOmit}
				<div class="space-y-4">
					<P>How intensely do you feel your expression?</P>
					<Range
						value={slideY}
						max="9"
						min="0"
						step="1"
						oninput={(e) => (slideY = e.currentTarget.valueAsNumber)}
					/>
					<div class="flex justify-between">
						<P>Not Intense</P>
						<P>{slideY}</P>
						<P>Very Intense</P>
					</div>
				</div>
			{:else if !omitX && omitY && !steps[currentStep - 1].disableOmit}
				<div class="space-y-4">
					<P>How do you feel your gender expression?</P>
					<Range
						value={slideX}
						max="9"
						min="0"
						step="1"
						oninput={(e) => (slideX = e.currentTarget.valueAsNumber)}
					/>
					<div class="flex justify-between">
						<P>Feminine</P>
						<P>{slideX}</P>
						<P>Masculine</P>
					</div>
				</div>
			{:else}
				<P>It's ok. Gender is complicated, and GIC-4 can accommodate that.</P>
			{/if}

			{#if !steps[currentStep - 1].disableOmit}
				<Toggle
					checked={omitX}
					onchange={(e) => {
						omitX = (e.currentTarget as HTMLInputElement).checked;
					}}>My gender is not on mortal human spectrum.</Toggle
				>
				<Toggle
					checked={omitY}
					onchange={(e) => (omitY = (e.currentTarget as HTMLInputElement).checked)}
					>The intensity of my expression is not on a binary spectrum.</Toggle
				>
			{/if}

			{#if currentSegment}
				<div class="flex justify-between">
					<div class="flex items-center gap-2">
						<Badge rounded large style={`background-color: ${badgeColor}`} class="text-nowrap"
							>{formatSegment(currentSegment)}</Badge
						>
						<P class="text-warp">{getSegmentMeaning(currentSegment, currentStep - 1)}</P>
					</div>
				</div>
			{/if}
			<div class="flex justify-between">
				<Button onclick={onBack} disabled={currentStep === 1}>Back</Button>
				<Button onclick={onNext} disabled={!currentSegment}>Next</Button>
			</div>
		</div>
	</Card>
</div>
