import { test } from "uvu";
import * as assert from "uvu/assert";
import { setupFixture } from "./test-utils";
import tokencss from "../src/index";

test("extended", async () => {
  const { cwd, postcss } = setupFixture('./extended');
  const { css } = await postcss.run("div { color: red }", {
    plugins: [
      tokencss({ cwd }),
    ],
  });
  assert.match(css, "var(--color-red)", "transforms red to --color-red");
});

test.run();
