import adapter from "@sveltejs/adapter-netlify";
import proprocess from "svelte-preprocess";

const config = {
  preprocess: proprocess({
    scss: {
      prependData: '@import "../global.scss";'
    }
  }),
	kit: {
		adapter: adapter(),
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte'
	}
};

export default config;
