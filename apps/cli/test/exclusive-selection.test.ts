import { describe, expect, it } from "bun:test";
import { PassThrough } from "node:stream";
import { stripVTControlCharacters } from "node:util";

import { navigableGroupMultiselect, resolveExclusiveSelection } from "../src/prompts/navigable";
import { runWithContextAsync } from "../src/utils/context";

const TASK_RUNNERS = ["turborepo", "vite-plus"] as const;

describe("resolveExclusiveSelection", () => {
  it("drops the other members of a set when a new one is selected", () => {
    expect(
      resolveExclusiveSelection(
        ["turborepo", "oxlint"],
        ["turborepo", "oxlint", "vite-plus"],
        [TASK_RUNNERS],
      ),
    ).toEqual(["oxlint", "vite-plus"]);
  });

  it("keeps a single member when a whole exclusive group is toggled on", () => {
    expect(
      resolveExclusiveSelection(["oxlint"], ["oxlint", "turborepo", "vite-plus"], [TASK_RUNNERS]),
    ).toEqual(["oxlint", "turborepo"]);
  });

  it("leaves deselection and unrelated values untouched", () => {
    expect(resolveExclusiveSelection(["vite-plus", "oxlint"], ["oxlint"], [TASK_RUNNERS])).toEqual([
      "oxlint",
    ]);
    expect(
      resolveExclusiveSelection(["vite-plus"], ["vite-plus", "oxlint"], [TASK_RUNNERS]),
    ).toEqual(["vite-plus", "oxlint"]);
  });
});

describe("navigableGroupMultiselect exclusive sets", () => {
  it("deselects the other task runner when space selects a new one", async () => {
    const input = new PassThrough();
    const output = Object.assign(new PassThrough(), { columns: 80, rows: 30 });
    let rendered = "";
    output.on("data", (chunk) => (rendered += chunk));

    const resultPromise = runWithContextAsync({}, () =>
      navigableGroupMultiselect<string>({
        message: "Pick addons",
        options: {
          "Monorepo & Tasks": [
            { value: "turborepo", label: "Turborepo" },
            { value: "vite-plus", label: "Vite+" },
          ],
          "Code Quality": [{ value: "oxlint", label: "Oxlint" }],
        },
        initialValues: ["oxlint"],
        required: false,
        exclusive: [TASK_RUNNERS],
        input,
        output,
      }),
    );

    // Keys are consumed synchronously in the stream's data -> keypress chain, which runs on
    // the next event-loop turn after write(); clack skips re-rendering for some keys, so
    // waiting on output would hang.
    const press = async (key: string) => {
      input.write(key);
      await new Promise((resolve) => setImmediate(resolve));
    };
    const down = "\x1b[B";
    await press(down);
    await press(" ");
    await press(down);
    await press(" ");
    await press("\r");

    expect(await resultPromise).toEqual(["oxlint", "vite-plus"]);
    const plain = stripVTControlCharacters(rendered);
    expect(plain).toContain("Monorepo & Tasks (choose one)");
    expect(plain).toContain("Vite+, Oxlint");
  });
});
