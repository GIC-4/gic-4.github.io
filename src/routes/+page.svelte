<script lang="ts">
	import { Accordion, AccordionItem, Button, Heading, P } from 'flowbite-svelte';
	import { ArrowRightOutline } from 'flowbite-svelte-icons';
	import GitHubLink from '$lib/components/GitHubLink.svelte';
	import { queryCode } from '$lib/store';
	import ResultCard from '$lib/components/ResultCard.svelte';

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
				<li>The first digit: direction (0 = fully female → 9 = fully male)</li>
				<li>The second digit: intensity (0 = minimal → 9 = high)</li>
			</ul>
			Use "-" to omit intensity when not applicable.
			`
		},
		{
			title: 'What does "intensity" mean?',
			content: `
			It indicates how strongly or how fully that characteristic is expressed, i.e., the magnitude or development of the trait. This is what makes GIC-4 unique, what is missing from all other gender quantification systems.
			`
		},
		{
			title: 'Examples',
			content: `
			A cis woman might have a GIC-4 code of <code>27,08,08,12</code>
            What does it mean?
            <ul class="${ulClass}">
                <li>27: this person is very feminine overall.</li>
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
			title: 'Why does It Matter/How do I use it?',
			content: `
			There are no numeric representations that fully capture the wide gender spectrum or the complex definitions of nonbinary identities. This tool can help people (not only trans or nonbinary individuals):
			<ul class="${ulClass}">
				<li>Understand their gender goal, provide a framework to talk to their gender care provider.</li>
				<li>Acknowledges the complexity of gender on the nonbinary spectrum, such as agender, demigenders, and more.</li>
				<li>Allows individuals to exchange their gender easily online.</li>
            </ul>
			Gender is a human-made label. You don't have to fit into any predefined boxes. You can pick and choose your own.
			Most importantly, treat this as an icebreaker: it doesn’t define you; it starts a conversation or a thought process about you.
			`
		},
		{
			title: 'How is the Color Generated?',
			content: `
			The color is generated from the GIC-4 code, mapping each pair to the digits to HSLA or RGBA values after normalization. It is just a visual representation of the code, and has no inherent meaning. You can switch between HSLA and RGBA views.
			`
		},
		{
			title: 'Privacy: How is my result stored?',
			content: `
			This website is fully static, client-side only. Your GIC-4 code and color are not stored on any server. The only way to share your result is through the URL generated when you share it manually. You can verify this by inspecting the network requests in your browser's developer tools, or checking our source code on GitHub.
			`
		}
	];
</script>

<GitHubLink />
<div class="mt-8 space-y-12 text-center">
	{#if $queryCode}
		<ResultCard />
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

	<div class="mx-auto w-full text-left">
		<Accordion multiple={true}>
			{#each accordion as item, i (item.title)}
				<AccordionItem open={i === 0}>
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
