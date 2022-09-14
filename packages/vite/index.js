import token from '@tokencss/postcss';
import preset from 'postcss-preset-env';

export default function tokencss() {
    return {
        name: '@tokencss/vite',
        config: () => ({
            css: {
                postcss: {
                    plugins: [
                        preset({
                            stage: 3,
                            features: {
                                'nesting-rules': true
                            }
                        }),
                        token(),
                    ]
                }
            }
        })
    }
}
