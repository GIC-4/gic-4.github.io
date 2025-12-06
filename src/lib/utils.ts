import type { GICDigits } from './types';

export const pink = '#ec4899';
export const blue = '#3b82f6';

// Gradient logic
export function lerpColor(a: string, b: string, t: number) {
	// a, b: hex color strings, t: 0-1
	const ah = a.replace('#', '');
	const bh = b.replace('#', '');
	const ar = parseInt(ah.substring(0, 2), 16);
	const ag = parseInt(ah.substring(2, 4), 16);
	const ab = parseInt(ah.substring(4, 6), 16);
	const br = parseInt(bh.substring(0, 2), 16);
	const bg = parseInt(bh.substring(2, 4), 16);
	const bb = parseInt(bh.substring(4, 6), 16);
	const r = Math.round(ar + (br - ar) * t);
	const g = Math.round(ag + (bg - ag) * t);
	const b_ = Math.round(ab + (bb - ab) * t);
	return {
		r,
		g,
		b: b_,
		toString: () => `rgb(${r}, ${g}, ${b_})`
	};
}

export function formatSegment(segment: [GICDigits | undefined, GICDigits | undefined]): string {
	if (segment[0] === undefined || segment[1] === undefined) return '';

	return `${segment[0] === null ? '-' : segment[0]}, ${segment[1] === null ? '-' : segment[1]}`;
}

export function formatSegments(segments: [GICDigits | undefined, GICDigits | undefined][]): string {
	return segments
		.map((s) => {
			return s.map((v) => (v === null ? '-' : v)).join('');
		})
		.join(',');
}

export function getSegmentMeaning(
	v: [GICDigits | undefined, GICDigits | undefined],
	i: number = 0
): string {
	if (v[0] === undefined || v[1] === undefined) return '';
	const result = ['It means you are '];

	const x = v[0];
	const y = v[1];
	if (i != 3) {
		if (x === null) {
			result[0] += 'not on binary gender spectrum';
		} else if (x >= 7) {
			result[0] += 'very masculine';
		} else if (x >= 4) {
			result[0] += 'somewhere in between';
		} else {
			result[0] += 'very feminine';
		}

		if (y === null) {
			result.push("and don't care about how much.");
		} else if (y >= 7) {
			result.push('very much so.');
		} else if (y >= 4) {
			result.push('moderately.');
		} else {
			if (!(x && x > 3 && x < 7)) {
				result.push('but not too much.');
			}
		}
	} else {
		if (x === null) {
			result[0] += 'not possible';
		} else if (x >= 7) {
			result[0] += 'very tough skin';
		} else if (x >= 4) {
			result[0] += 'somewhere in between';
		} else {
			result[0] += 'very soft skin';
		}

		if (y === null) {
			result.push('not possible.');
		} else if (y >= 7) {
			result.push('and very hairy.');
		} else if (y >= 4) {
			result.push('and moderately hairy.');
		} else {
			result.push('and not very hairy.');
		}
	}

	return result.join(', ');
}

export function getContrastTextColor(color: string): string {
	// Helper to clamp and parse
	function clamp(v: number) {
		return Math.max(0, Math.min(255, v));
	}
	let r = 0,
		g = 0,
		b = 0;
	if (color.startsWith('rgba')) {
		const m = color.match(/rgba?\(([^)]+)\)/);
		if (m) {
			const parts = m[1].split(',').map(Number);
			[r, g, b] = parts;
		}
	} else if (color.startsWith('hsla') || color.startsWith('hsl')) {
		const m = color.match(/hsla?\(([^)]+)\)/);
		if (m) {
			// h, s%, l%, [a]
			const parts = m[1].split(',').map((v) => v.trim());
			const h = Number(parts[0]);
			const s = Number(parts[1].replace('%', '')) / 100;
			const l = Number(parts[2].replace('%', '')) / 100;
			// Convert HSL to RGB
			const c = (1 - Math.abs(2 * l - 1)) * s;
			const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
			const m_ = l - c / 2;
			let r1 = 0,
				g1 = 0,
				b1 = 0;
			if (h < 60) [r1, g1, b1] = [c, x, 0];
			else if (h < 120) [r1, g1, b1] = [x, c, 0];
			else if (h < 180) [r1, g1, b1] = [0, c, x];
			else if (h < 240) [r1, g1, b1] = [0, x, c];
			else if (h < 300) [r1, g1, b1] = [x, 0, c];
			else [r1, g1, b1] = [c, 0, x];
			r = clamp(Math.round((r1 + m_) * 255));
			g = clamp(Math.round((g1 + m_) * 255));
			b = clamp(Math.round((b1 + m_) * 255));
		}
	}
	// Calculate luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	// console.log('luminance', luminance, color);

	return luminance > 0.5 ? '#222' : '#fff';
}
