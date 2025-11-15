<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		Button,
		ButtonGroup,
		Card,
		Heading,
		Mark,
		P,
		Toggle,
		Tooltip
	} from 'flowbite-svelte';
	import { ArrowRightOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import iro from '@jaames/iro';
	import _zip from 'lodash/zip';
	import _chunk from 'lodash/chunk';
	import type { IroColorPicker } from '@jaames/iro/dist/ColorPicker';
	import { getSegmentMeaning } from '$lib/utils';
	import type { GICDigits } from '$lib/types';
	// Access query params using browser API, reactive
	let code = $state('');
	let ignoreAlpha = $state(false);

	function updateCodeFromURL() {
		const params = new URLSearchParams(window.location.search);
		code = params.get('code') ?? '';
	}
	onMount(() => {
		updateCodeFromURL();
		window.addEventListener('popstate', updateCodeFromURL);
		return () => window.removeEventListener('popstate', updateCodeFromURL);
	});
	let pickerView = $state('HSLA');
	let numberArray = $derived(
		code
			?.split(',')
			.flatMap((s) => s.split(''))
			.map((s) => {
				if (Number.isNaN(parseInt(s))) {
					return 0;
				} else {
					return parseInt(s);
				}
			})
	);

	let colorCode = $derived.by(() => {
		const b = _chunk(numberArray, 2).map((x, i) => {
			let num = x[0] * 10 + x[1];

			let hsl: string | number = Math.round((num / 100) * 100).toString() + '%';
			let rgb = Math.round((num / 100) * 255);

			if (i === 0) {
				hsl = Math.round((num / 100) * 360);
			} else if (i === 3) {
				hsl = num / 100;
				rgb = hsl;
			}

			return {
				rgb,
				hsl
			};
		});
		console.log(b);
		return b;
	});
	let picker = $state<IroColorPicker>();
	onMount(() => {
		if (code) {
			// Responsive width for ColorPicker
			function getPickerWidth() {
				if (window.innerWidth < 640) return 200; // sm
				if (window.innerWidth < 768) return 260; // md
				if (window.innerWidth < 1024) return 300; // lg
				return 300; // xl+
			}
			picker = iro.ColorPicker('#picker', {
				width: getPickerWidth(),
				layout: [
					{
						component: iro.ui.Wheel
					}
				]
			});
			window.addEventListener('resize', () => {
				if (picker) picker.resize(getPickerWidth());
			});
			picker.on('color:change', () => {
				changePickerView(pickerView);
			});
			changePickerView(pickerView);

			if (requireMoreAlpha()) {
				ignoreAlpha = true;
			}
		}
	});

	function changePickerView(view: string) {
		if (view === 'RGBA' && picker) {
			pickerView = 'RGBA';
			picker.color.rgbaString = getRGBAColor();
		} else if (view === 'HSLA' && picker) {
			pickerView = 'HSLA';
			picker.color.hslaString = getHSLAColor();
		}
	}

	let gicColor = $derived.by(() => {
		if (pickerView === 'RGBA') {
			return getRGBAColor();
		} else {
			return getHSLAColor();
		}
	});

	function requireMoreAlpha() {
		return (colorCode[3] && (colorCode[3].hsl as number)) < 0.5;
	}

	function getRGBAColor(): string {
		// Returns a valid CSS rgba() string
		if (ignoreAlpha) {
			return `rgba(${colorCode
				.map((c) => c.rgb)
				.slice(0, 3)
				.join(', ')}, 1)`;
		}
		return `rgba(${colorCode.map((c) => c.rgb).join(', ')})`;
	}

	function getHSLAColor(): string {
		// Returns a valid CSS hsla() string
		if (ignoreAlpha) {
			return `hsla(${colorCode
				.map((c) => c.hsl)
				.slice(0, 3)
				.join(', ')}, 1)`;
		}
		return `hsla(${colorCode.map((c) => c.hsl).join(', ')})`;
	}

	const accordion = [
		{
			title: 'What is GIC-4?',
			content: `<strong>GIC-4</strong> is a compact four-pair numeric code that quantizes a person’s gender goal across:
				<ul class="list-disc ml-6 mt-2">
					<li><strong>Presentation</strong></li>
					<li><strong>Chest</strong></li>
					<li><strong>Genitals</strong></li>
					<li><strong>Skin/Hair</strong></li>
				</ul>
 				Each pair uses:
				<ul class="list-disc ml-6 mt-2">
					<li><strong>Tens digit</strong>: direction (0 = fully female → 9 = fully male)</li>
					<li><strong>Ones digit</strong>: intensity (0 = minimal → 9 = high)</li>
				</ul>
 				Use “-” to omit intensity when not applicable.
			`
		},
		{
			title: 'How Does It Work?',
			content: `GIC-4 breaks down gender expression into four key areas: overall, chest, genitals, and skin/hair.
 				Each area is represented by a pair of digits, allowing for a nuanced representation of an individual's gender goals.
			`
		},
		{
			title: 'Why Does It Matter?',
			content: `<ul class="list-disc ml-6 mt-2">
					<li>Provides a more granular understanding of gender identity and expression, moving beyond the binary framework.</li>
					<li>Acknowledges the complexity of gender.</li>
					<li>Allows individuals to exchange their gender goal easily.</li>
				</ul>
			`
		}
	];

	function genExplain() {
		const chunks = _chunk(numberArray, 2).map((x, i) => {
			return getSegmentMeaning(x as [GICDigits | undefined, GICDigits | undefined], i).replace(
				'It means you are ',
				''
			);
		});

		const segmentNames = [
			'Your overall representation is ',
			'Your chest is ',
			'Your genitals are ',
			'Your have '
		];

		return _zip(segmentNames, chunks)
			.map(([a, b]) => a! + b)
			.join('\n');
	}
</script>

<div class="mt-8 space-y-12 text-center">
	{#if code}
		<div class="mx-auto flex flex-col items-center">
			<Card
				class="
      p-4
      sm:p-5
      md:p-7
    "
				size="lg"
			>
				<div class="mx-auto flex flex-col items-center space-y-8 text-center">
					<Heading tag="h2"
						>Your GIC-4 Code is <Mark
							style={`background-color: ${gicColor}`}
							class="
         cursor-pointer text-slate-800
         dark:text-white
       "
							onclick={() => {
								if (code) navigator.clipboard.writeText(code);
							}}>{code}</Mark
						>
						<Tooltip>Copied to clipboard</Tooltip>
					</Heading>
					<ButtonGroup class="*:ring-primary-700!">
						<Button onclick={() => changePickerView('HSLA')} disabled={pickerView === 'HSLA'}
							>HSLA</Button
						>

						<Button onclick={() => changePickerView('RGBA')} disabled={pickerView === 'RGBA'}
							>RGBA</Button
						>
					</ButtonGroup>

					<div id="picker" class="mx-auto"></div>
					<div class="mx-auto h-24 w-24" style={`background-color: ${gicColor}`}></div>
					<Heading tag="h3" class="text-lg">
						Your GIC-4 Color is
						<Mark
							style={`background-color: ${gicColor}`}
							class="
         cursor-pointer text-slate-800
         dark:text-white
       "
							onclick={() => {
								navigator.clipboard.writeText(gicColor);
							}}
						>
							{gicColor}
						</Mark>
						<Tooltip>Copied to clipboard</Tooltip>
					</Heading>
					<div class="flex flex-col items-center gap-2">
						<Toggle
							checked={ignoreAlpha}
							onchange={() => {
								ignoreAlpha = !ignoreAlpha;
							}}
							>Ignore Alpha
						</Toggle>
						{#if requireMoreAlpha()}
							<P
								class="
          text-center text-sm text-gray-500
          dark:text-gray-400
        "
							>
								Note: Alpha value too low, we turned off alpha so you can see it :P
							</P>
						{/if}
					</div>

					<div class="flex flex-col items-center">
						<Heading tag="h3" class="mb-2 text-lg">What Does This Mean?</Heading>
						<P class="mx-auto whitespace-pre-line">
							{genExplain()}
						</P>
					</div>
					<div class="flex flex-col items-center gap-3">
						<Button
							onclick={() => {
								const url = `${window.location.origin}${window.location.pathname}?code=${code}`;
								if (navigator.share) {
									navigator.share({
										title: 'My GIC-4 Result',
										text: `Check out my GIC-4 code: ${code}`,
										url
									});
								}
								navigator.clipboard.writeText(url);
							}}
							color="primary"
							class="
         w-full
         sm:w-auto
       "
						>
							Share result
						</Button>
						<Tooltip>Copied to clipboard</Tooltip>
						<P
							class="
         text-center text-sm text-gray-500
         dark:text-gray-400
       "
						>
							You can share your GIC-4 code and color with friends using the button above.
						</P>
					</div>
				</div>
			</Card>
		</div>
	{/if}

	<div>
		<Heading
			tag="h1"
			class="
     mb-4 text-4xl font-extrabold
     md:text-5xl
     lg:text-6xl
   "
		>
			GIC-4 (Gender Intensity Code 4)
		</Heading>
	</div>
	<div>
		<P
			class="
     mb-6 text-center text-lg
     sm:px-16
     lg:text-xl
     xl:px-48
     dark:text-gray-400
   "
			>An attempt to quantify gender expression by creating 100 million genders, while maintaining
			human readability.
		</P>
	</div>
	<div>
		<Button href="./quiz" color="secondary">
			Take Quiz
			<ArrowRightOutline class="ms-2 h-6 w-6" />
		</Button>
	</div>

	<div class="mx-auto w-fit text-left">
		<Accordion multiple={true}>
			{#each accordion as item (item.title)}
				<AccordionItem open={true}>
					{#snippet header()}{item.title}{/snippet}
					<div
						class="
        mb-2 whitespace-pre-line text-gray-500
        dark:text-gray-400
      "
					>
						<!-- eslint-disable svelte/no-at-html-tags -->
						{@html item.content}
					</div>
				</AccordionItem>
			{/each}
		</Accordion>
	</div>
</div>
