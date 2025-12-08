<script lang="ts">
	import { queryCode } from '$lib/store';
	import { genExplain } from '$lib/utils';
	import { Button, ButtonGroup, Card, Heading, P, Toggle, Tooltip } from 'flowbite-svelte';
	import ColorCode from './ColorCode.svelte';
	import type { IroColorPicker } from '@jaames/iro/dist/ColorPicker';
	import _chunk from 'lodash/chunk';
	import iro from '@jaames/iro';
	import { onMount } from 'svelte';

	let ignoreAlpha = $state(false);
	let pickerView = $state('HSLA');
	let picker = $state<IroColorPicker>();

	let numberArray = $derived(
		$queryCode
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
		return b;
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

	function initPicker() {
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

	onMount(() => {
		initPicker();
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
</script>

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
				Your GIC-4 Code is <ColorCode {gicColor} text={$queryCode} />
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
					{genExplain(numberArray)}
				</P>
			</div>
			<div class="flex flex-col items-center gap-3">
				<Button
					onclick={() => {
						const url = `${window.location.origin}${window.location.pathname}?code=${$queryCode}`;
						if (navigator.share) {
							navigator.share({
								title: 'My GIC-4 Result',
								text: `Check out my GIC-4 code: ${$queryCode}`,
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
