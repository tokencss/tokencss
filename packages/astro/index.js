import tokens from '@tokencss/postcss';
import preset from 'postcss-preset-env';

export default function tokencss() {
    return {
        name: '@tokencss/vite',
        hooks: {
			'astro:config:setup': async ({ config, injectScript }) => {
				config.style.postcss.plugins.push(
                    preset({
                        stage: 3,
                        features: {
                            'nesting-rules': true
                        }
                    }),
                    tokens(),
                );
                injectScript('page-ssr', `import '@tokencss/astro/base.css';`);
			},
		}
    }
}
