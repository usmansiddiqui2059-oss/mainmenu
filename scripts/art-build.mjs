import { spawnSync } from "node:child_process";
for (const [script, args] of [
  ["scripts/build-plates.mjs", []],
  [
    "node_modules/vitest/vitest.mjs",
    ["run", "tests/artwork.test.ts", "--reporter=dot"],
  ],
]) {
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: "inherit",
    env: { ...process.env, MC_WRITE_ASSETS: "1" },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
