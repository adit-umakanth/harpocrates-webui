import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				'primary-a10': '#638ed9',
				'primary-a20': '#7a9bde',
				'primary-a30': '#8ea9e3',
				'primary-a40': '#a2b7e8',
				'primary-a50': '#b5c5ed',
				'surface-a0': '#121212',
				'surface-a10': '#282828',
				'surface-a20': '#3f3f3f',
				'surface-a30': '#575757',
				'surface-a40': '#717171',
				'surface-a50': '#8b8b8b'
			}
		}
	},

	plugins: [typography, forms, containerQueries]
} satisfies Config;
