<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		Button,
		ButtonGroup,
		Card,
		Heading,
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
	import GitHubLink from '$lib/components/GitHubLink.svelte';
	import ColorCode from '$lib/components/ColorCode.svelte';
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

	const ulClass = 'list-disc ml-6 flex flex-col gap-y-2 mt-2';

	const accordion = [
		{
			title: 'What is GIC-4?',
			content: `
			<strong>GIC-4 (Gender Intensity Code - 4)</strong> is a compact four-pair numeric code that quantizes a person’s gender across:
			<ul class="${ulClass}">
				<li>Presentation</li>
				<li>Chest</li>
				<li>Genitals</li>
				<li>Skin/Hair</li>
			</ul>
			Each pair uses:
			<ul class="${ulClass}">
				<li>Tens digit: direction (0 = fully female → 9 = fully male)</li>
				<li>Ones digit: intensity (0 = minimal → 9 = high)</li>
			</ul>
			Use "-" to omit intensity when not applicable.
			`
		},
		{
			title: 'Examples',
			content: `
			A cis woman might have a GIC-4 code of <code>27,08,08,12</code>
            What does it mean?
            <ul class="${ulClass}">
                <li>26: this person is very feminine overall.</li>
                <li>08: this person has very feminine-looking breasts, and quite big.</li>
                <li>08: this person has very feminine-looking genitalia, and quite developed.</li>
                <li>12: this person has very soft skin, and not hairy.</li>
            </ul>
            
            An agender person might have a GIC-4 code of <code>-8,62,-5,00</code>
            <ul class="${ulClass}">
                <li>-2: this person doesn't believe in the binary sex spectrum; however, they do believe in the concept of gender; it's just that we have no experience.</li>
                <li>62: this person has an ambiguous flat chest.</li>
                <li>-5: this person's private parts are neither found on male nor female; it's a different expression entirely.</li>
                <li>00: this person has very soft hairless skin.</li>
            </ul>
            
            A gender fluid person might have a GIC-4 code of <code>(27,08,08,12)-(87,86,77,00)</code>
            They can express their gender with multiple GIC-4 codes, switching between them as they feel.


            If your gender is a collapsible wave function, you can write it in bra-ket notation. Example:

            <code>|Ψ⟩ = c₁|(27,08,08,12)⟩ + c₂|(87,86,77,00)⟩</code>

            This will represent gender superposition.
            `
		},
		{
			title: 'Why does It Matter?',
			content: `
			There are no numeric representations for the wide gender spectrum and complicated nonbinary definitions. This tool can help people (not just trans or nonbinary):
			<ul class="${ulClass}">
				<li>Provides a more granular understanding of gender identity and expression, moving beyond the binary framework.</li>
				<li>Acknowledges the complexity of gender, including the nonbinary spectrum, agender, demigenders, and more!</li>
				<li>Allows individuals to exchange their gender easily.</li>
            </ul>
			And most importantly, it expresses that gender is a human-made label. You don't have to fit into any predefined boxes. You can pick and choose your own.
			`
		},
		{
			title: 'How is the Color Generated?',
			content: `
			The color is generated from the GIC-4 code, mapping each pair to the digits to HSLA or RGBA values after normalization. It is just a visual representation of the code, and has no inherent meaning. You can switch between HSLA and RGBA views.
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

<GitHubLink />
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
					<Heading tag="h2">
						Your GIC-4 Code is <ColorCode {gicColor} text={code} />
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
						<ColorCode {gicColor} text={gicColor} />
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
						{@html item.content.trim()}
					</div>
				</AccordionItem>
			{/each}
		</Accordion>
	</div>
</div>
