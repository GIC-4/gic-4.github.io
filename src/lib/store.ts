import { writable } from 'svelte/store';

export const darkMode = writable(false);
export const loadChart = writable<[number, number] | null>(null);
