import { test } from "uvu";
import * as assert from "uvu/assert";
import { setup } from "./test-utils";
import tokencss from "../src/index";

test("basic transform", async () => {
  const { postcss } = setup();
  const { css } = await postcss.run("div { color: red }", {
    plugins: [
      tokencss({
        config: { color: { type: "color", red: { value: "#F00" } } },
      }),
    ],
  });
  assert.match(css, "var(--color-red)", "transforms red to --color-red");
});

test("rgb transform", async () => {
  const { postcss } = setup();
  const { css } = await postcss.run("div { color: rgb(red / 50%) }", {
    plugins: [
      tokencss({
        config: { color: { type: "color", red: { value: "#F00" } } },
      }),
    ],
  });
  assert.match(
    css,
    "rgb(var(--color-red-rgb)",
    "transforms rgb(red) to --color-red-rgb"
  );
});

test("atrule transform", async () => {
  const { postcss } = setup();
  const { css } = await postcss.run('@inject "tokencss:base";', {
    plugins: [
      tokencss({
        config: { color: { type: "color", red: { value: "#F00" } } },
      }),
    ],
  });
  assert.is(
    css,
    `:root {
  --color-red: #F00;
  --color-red-rgb: 255, 0, 0;
  --tokencss: 1;
}`
  );
});

test("@media", async () => {
  const { postcss } = setup();
  const { css } = await postcss.run('@media (sm) {}', {
    plugins: [
      tokencss({
        config: { 
            media: { sm: { value: '(min-width: 640px)' } }
        },
      }),
    ],
  });
  assert.is(
    css,
    `@media (min-width: 640px) {}`
  );
});

test("@media generated vars", async () => {
  const { postcss } = setup();
  const { css } = await postcss.run('@inject "tokencss:base"', {
    plugins: [
      tokencss({
        config: { 
            media: { sm: { value: '(min-width: 640px)' } }
        },
      }),
    ],
  });
  assert.is(
    css,
    `:root {
  --media-sm: (min-width: 640px);
  --tokencss: 1;
  --tokencss-media: var(--media-sm);
}`
  );
});

test("@media generated vars (multiple)", async () => {
  const { postcss } = setup();
  const { css } = await postcss.run('@inject "tokencss:base"', {
    plugins: [
      tokencss({
        config: { 
            media: { sm: { value: '(min-width: 640px)' }, md: { value: '(min-width: 820px)' } }
        },
      }),
    ],
  });
  assert.is(
    css,
    `:root {
  --media-sm: (min-width: 640px);
  --media-md: (min-width: 820px);
  --tokencss: 1;
  --tokencss-media: var(--media-sm), var(--media-md);
}`
  );
});

test("@inject \"tokencss:container\";", async () => {
  const { postcss } = setup();
  const { css } = await postcss.run('@inject "tokencss:container"', {
    plugins: [
      tokencss({
        config: { 
            media: { sm: { value: '(min-width: 640px)' }, md: { value: '(min-width: 820px)' } }
        },
      }),
    ],
  });
  assert.is(
    css,
    `.container {
  width: calc(100% - calc(var(--container-margin-inline, 0.75rem) * 2));
  max-width: calc(var(--container-max-width, 100%) - calc(var(--container-margin-inline, 0.75rem) * 2));
  padding-right: var(--container-padding-inline, 0);
  padding-left: var(--container-padding-inline, 0);
  margin-right: auto;
  margin-left: auto;
}
@media (min-width: 640px) {
  :root { --container-max-width: 640px; }
}
@media (min-width: 820px) {
  :root { --container-max-width: 820px; }
}`
  );
});

test("sizes", async () => {
  const { postcss } = setup();
  const { css } = await postcss.run("div { width: lg }", {
    plugins: [
      tokencss({
        config: { size: { lg: { value: "2rem" } } },
      }),
    ],
  });
  assert.match(css, "var(--size-lg)", "transforms width lg to --size-lg");
});

test.run();
