<script lang="ts">
	import { getContrastTextColor } from '$lib/utils';
	import { Mark, Span } from 'flowbite-svelte';
	interface Props {
		gicColor: string;
		text: string;
	}
	const { gicColor, text }: Props = $props();
</script>

<Mark
	style={`background-color: ${gicColor}`}
	class="
   cursor-pointer text-slate-800
   dark:text-white
 "
	onclick={() => {
		navigator.clipboard.writeText(text);
	}}
>
	<Span style={`color: ${getContrastTextColor(gicColor)}`}>{text}</Span>
</Mark>
