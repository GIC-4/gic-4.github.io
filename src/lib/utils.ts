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
			result[0] += 'not on mortal human spectrum';
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
