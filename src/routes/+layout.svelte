<script lang="ts">
	import { Navbar, NavBrand } from 'flowbite-svelte';

	import '../app.css';
	import DarkMode from '$lib/DarkMode.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>GIC-4 - Human Readable Gender Quantifier</title>
	<meta
		name="description"
		content="An attempt to quantify gender expression by creating 100 million genders, while maintaining human readability."
	/>
	<meta
		name="keywords"
		content="GIC-4, gender code, gender descriptor, gender spectrum shorthand, gender quantization, nonbinary identifier, gender code, gender notation, gender presentation code, trans planning tool"
	/>
	<meta property="og:title" content="GIC-4 - Human Readable Gender Quantifier" />
	<meta
		property="og:description"
		content="An attempt to quantify gender expression by creating 100 million genders, while maintaining human readability."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content=" " />
	<meta property="og:image" content=" " />
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
