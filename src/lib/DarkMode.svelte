<script lang="ts">
	import { onMount } from 'svelte';
	import { darkMode } from './store';

	onMount(() => {
		const getSystemPref = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
		const getTheme = () => {
			if ('theme' in localStorage) {
				return localStorage.theme === 'dark';
			}
			return getSystemPref();
		};
		const setTheme = () => {
			const isDark = getTheme();
			document.documentElement.classList.toggle('dark', isDark);
			darkMode.set(isDark);
		};
		setTheme();
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = () => {
			if (!('theme' in localStorage)) {
				setTheme();
			}
		};
		mediaQuery.addEventListener('change', handler);
		return () => {
			mediaQuery.removeEventListener('change', handler);
		};
	});
</script>
