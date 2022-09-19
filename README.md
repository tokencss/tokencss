# Token CSS

Token CSS is a new tool that seamlessly integrates [Design Tokens](https://design-tokens.github.io/community-group/format/#design-token) into your development workflow. Conceptually, it is similar to tools
like [Tailwind](https://tailwindcss.com), [Styled System](https://styled-system.com/), and many CSS-in-JS libraries that provide tokenized _constraints_ for your styles&mdash;but there's one big difference.

**Token CSS embraces `.css` files and `<style>` blocks.**

## Installation

Building your site with [Astro](https://astro.build)? Use the official Astro integration.

```shell
npm run astro add @tokencss/astro
```

Otherwise, install `@tokencss/postcss` and add it to your PostCSS configuration.

```shell
npm install @tokencss/postcss
```

```js
const tokencss = require("@tokencss/postcss");

module.exports = {
  plugins: [tokencss()],
};
```

## Configuration

Create a `token.config.json` file in the root of your project&mdash;the `@tokencss/postcss` plugin will automatically pick this up.

> **Warning**: It is intended that this file will follow the final [Design Tokens Format Module](https://design-tokens.github.io/community-group/format/), but we are currently following an older draft version of the spec. Expect breaking changes as we attempt to stay in sync with the latest version!

You may either extend our built-in [Preset](https://github.com/tokencss/tokencss/blob/main/packages/core/preset/token.config.json)...

```json
{
  "$schema": "https://tokencss.com/schema@0.0.1",
  "extends": ["@tokencss/core/preset"]
}
```

Or create your own file from scratch.

```json
{
  "$schema": "https://tokencss.com/schema@0.0.1",
  "extends": ["@tokencss/core"],
  "color": {
    "gray": {
      "0": { "value": "#f8f9fa" },
      "1": { "value": "#f1f3f5" },
      "2": { "value": "#e9ecef" },
      "3": { "value": "#dee2e6" },
      "4": { "value": "#ced4da" },
      "5": { "value": "#adb5bd" },
      "6": { "value": "#868e96" },
      "7": { "value": "#495057" },
      "8": { "value": "#343a40" },
      "9": { "value": "#212529" }
    }
  },
  "space": {
    "2xs": { "value": ".25rem" },
    "xs": { "value": ".5rem" },
    "sm": { "value": "1rem" },
    "md": { "value": "1.25rem" },
    "lg": { "value": "1.5rem" },
    "xl": { "value": "1.75rem" },
    "2xl": { "value": "2rem" },
    "3xl": { "value": "3rem" },
    "4xl": { "value": "4rem" },
    "5xl": { "value": "5rem" },
    "6xl": { "value": "7.5rem" },
    "7xl": { "value": "10rem" },
    "8xl": { "value": "15rem" },
    "9xl": { "value": "20rem" },
    "10xl": { "value": "30rem" }
  },
  "size": {
    "full": { "value": "100%" },
    "2xs": { "value": ".25rem" },
    "xs": { "value": ".5rem" },
    "sm": { "value": "1rem" },
    "md": { "value": "1.25rem" },
    "lg": { "value": "1.5rem" },
    "xl": { "value": "1.75rem" },
    "2xl": { "value": "2rem" },
    "3xl": { "value": "3rem" },
    "4xl": { "value": "4rem" },
    "5xl": { "value": "5rem" },
    "6xl": { "value": "7.5rem" },
    "7xl": { "value": "10rem" },
    "8xl": { "value": "15rem" },
    "9xl": { "value": "20rem" },
    "10xl": { "value": "30rem" }
  },
  "width": {
    "screen": { "value": "100vw" }
  },
  "height": {
    "screen": { "value": "100vh" }
  },
  "radius": {
    "none": { "value": "0px" },
    "sm": { "value": "0.125rem" },
    "default": { "value": "0.25rem" },
    "md": { "value": "0.375rem" },
    "lg": { "value": "0.5rem" },
    "xl": { "value": "0.75rem" },
    "2xl": { "value": "1rem" },
    "3xl": { "value": "1.5rem" },
    "full": { "value": "9999px" }
  },
  "shadow": {
    "default": {
      "value": [
        {
          "offset-x": "0px",
          "offset-y": "1px",
          "blur": "3px",
          "spread": "0px",
          "color": "#000",
          "opacity": 0.1
        },
        {
          "offset-x": "0px",
          "offset-y": "1px",
          "blur": "2px",
          "spread": "-1px",
          "color": "#000",
          "opacity": 0.1
        }
      ]
    }
  },
  "font": {
    "sans": {
      "value": [
        "system-ui",
        "-apple-system",
        "Segoe UI",
        "Roboto",
        "Ubuntu",
        "Cantarell",
        "Noto Sans",
        "sans-serif"
      ]
    }
  },
  "font-size": {
    "xs": { "value": "0.75rem" },
    "sm": { "value": "0.875rem" },
    "default": { "value": "1rem" },
    "lg": { "value": "1.125rem" },
    "xl": { "value": "1.25rem" },
    "2xl": { "value": "1.5rem" },
    "3xl": { "value": "1.875rem" },
    "4xl": { "value": "2.25rem" },
    "5xl": { "value": "3rem" },
    "6xl": { "value": "3.75rem" },
    "7xl": { "value": "4.5rem" },
    "8xl": { "value": "6rem" },
    "9xl": { "value": "8rem" }
  },
  "font-weight": {
    "thin": { "value": 100 },
    "extralight": { "value": 200 },
    "light": { "value": 300 },
    "normal": { "value": 400 },
    "medium": { "value": 500 },
    "semibold": { "value": 600 },
    "bold": { "value": 700 },
    "extrabold": { "value": 800 },
    "black": { "value": 900 }
  },
  "line-height": {
    "none": { "value": 1 },
    "tight": { "value": 1.25 },
    "snug": { "value": 1.375 },
    "normal": { "value": 1.5 },
    "relaxed": { "value": 1.625 },
    "loose": { "value": 2 }
  },
  "letter-spacing": {
    "tighter": { "value": "-0.05em" },
    "tight": { "value": "-0.025em" },
    "normal": { "value": "0em" },
    "wide": { "value": "0.025em" },
    "wider": { "value": "0.05em" },
    "widest": { "value": "0.1em" }
  },
  "easing": {
    "cubic": {
      "in": { "value": [0.32, 0, 0.67, 0] },
      "out": { "value": [0.33, 1, 0.68, 1] },
      "in-out": { "value": [0.65, 0, 0.35, 1] }
    }
  }
}
```

## Setup

> **Note:** Using Astro? You can skip this step! Token variables are automatically injected by the integration.

If you are using our plain PostCSS setup, you should include the following line in the root of your stylesheet. This will inject `--custom-property` declarations for all of your tokens.

```css
@inject "tokencss:base";
```

## Usage

You're ready to use tokens in your CSS!

```css
.box {
  background: red.5;
  border-radius: md;
  width: lg;
  height: lg;
  /* Custom Properties are also supported! */
  --color: blue.6;
  --margin: sm;
}
```

## Editor integration

Be sure to install our [Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=tokencss.tokencss-vscode) extension for the best experience.
