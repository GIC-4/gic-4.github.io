<script lang="ts">
	import { Navbar, NavBrand } from 'flowbite-svelte';

	import '../app.css';
	import DarkMode from '$lib/DarkMode.svelte';
	import { genExplain } from '$lib/utils';
	import { onMount } from 'svelte';
	import { queryCode } from '$lib/store';

	let { children } = $props();

	function updateCodeFromURL() {
		const params = new URLSearchParams(window.location.search);

		queryCode.set(params.get('code') ?? '');
	}

	onMount(() => {
		updateCodeFromURL();
		const handler = updateCodeFromURL;
		window.addEventListener('popstate', handler);
		return () => window.removeEventListener('popstate', handler);
	});

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

	const title = $derived.by(() => {
		return $queryCode ? `My GIC-4 Code: ${$queryCode}` : 'GIC-4 - Gender Intensity Code - 4';
	});
	const description = $derived.by(() => {
		return $queryCode
			? `Here is my result: ${genExplain(numberArray, true)} \n Click the link to get your result.`
			: 'An attempt to quantify gender expression by creating 100 million genders, while maintaining human readability.';
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta
		name="keywords"
		content="GIC-4, gender code, gender, gender spectrum, gender quantization, nonbinary, gender code, transgender, gender presentation, trans"
	/>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://gic-4.github.io/" />
	<meta property="og:image" content="https://gic-4.github.io/favicon.png" />
</svelte:head>
<DarkMode />
<div
	class="
   min-h-screen bg-gray-50
   dark:bg-gray-900
 "
>
	<Navbar
		class="
    border-gray-200 bg-white px-4 py-2.5
    lg:px-6
    dark:bg-gray-800
  "
	>
		<NavBrand href="./">
			<span
				class="
      self-center text-xl font-semibold whitespace-nowrap
      dark:text-white
    ">GIC-4</span
			>
		</NavBrand>
	</Navbar>
	<main class="container mx-auto p-4">
		{@render children()}
	</main>
</div>
