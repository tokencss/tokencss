import tokens from "./fixtures/scales/token.config.json";
import { resolveTokens } from "../src/tokens";

import { test } from "uvu";
import * as assert from "uvu/assert";

test("tokens", () => {
  const shadow = resolveTokens(tokens)["shadow.xl"].value;
  assert.type(shadow, "object");
  assert.equal(JSON.stringify(shadow), JSON.stringify([
    {
      x: {
        value: { value: "0px", type: "dimension", required: true },
        type: "dimension",
        required: true,
      },
      y: {
        value: { value: "20px", type: "dimension", required: true },
        type: "dimension",
        required: true,
      },
      blur: {
        value: { value: "25px", type: "dimension", required: true },
        type: "dimension",
        required: true,
      },
      spread: {
        value: { value: "-5px", type: "dimension", required: false },
        type: "dimension",
        required: false,
      },
      color: {
        value: {
          value: "#4dabf7",
          type: "color",
          required: true,
          $path: "color.blue.4",
          $scale: "color",
        },
        type: "color",
        required: true,
      },
      opacity: {
        value: { value: 0.1, type: "number", required: false },
        type: "number",
        required: false,
      },
    },
    {
      x: {
        value: { value: "0px", type: "dimension", required: true },
        type: "dimension",
        required: true,
      },
      y: {
        value: { value: "8px", type: "dimension", required: true },
        type: "dimension",
        required: true,
      },
      blur: {
        value: { value: "10px", type: "dimension", required: true },
        type: "dimension",
        required: true,
      },
      spread: {
        value: { value: "-6px", type: "dimension", required: false },
        type: "dimension",
        required: false,
      },
      color: {
        value: { value: "#000", type: "color", required: true },
        type: "color",
        required: true,
      },
      opacity: {
        value: { value: 0.1, type: "number", required: false },
        type: "number",
        required: false,
      },
    },
  ]));
});
