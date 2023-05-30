import daisyui from 'daisyui'
import typography from '@tailwindcss/typography'
import themes from 'daisyui/src/colors/themes'

console.log(themes['[data-theme=corporate]'])
export default {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins']
      }
    },
  },
  plugins: [typography, daisyui],
  daisyui: {
    themes: [
      {
        corporate: {
          ...themes["[data-theme=corporate]"],
          secondary: '#85F473'
        }
      }
    ]
  }
}
