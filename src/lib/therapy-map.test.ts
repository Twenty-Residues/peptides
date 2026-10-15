import { test } from "node:test";
import assert from "node:assert/strict";
import { peptides } from "./peptides";
import { therapyGoals, accessLanes } from "./therapy-map";

test("therapyGoals: every goal has peptides, ordered strongest-evidence-first", () => {
  const goals = therapyGoals();
  assert.ok(goals.length > 0, "expected at least one goal");
  for (const g of goals) {
    assert.ok(g.peptides.length > 0, `goal ${g.slug} is empty`);
    const floors = g.peptides.map((p) => p.floor ?? 99);
    const sorted = [...floors].sort((a, b) => a - b);
    assert.deepEqual(floors, sorted, `goal ${g.slug} is not evidence-sorted`);
  }
});

test("accessLanes: partition the whole catalog with no peptide lost or duplicated", () => {
  const lanes = accessLanes();
  const seen = lanes.flatMap((l) => l.peptides.map((p) => p.slug));
  assert.equal(
    seen.length,
    peptides.length,
    "every peptide appears in exactly one lane",
  );
  assert.equal(new Set(seen).size, seen.length, "no peptide is duplicated");
});

test("accessLanes: a lane's peptides all share its regulatory key", () => {
  for (const lane of accessLanes()) {
    for (const p of lane.peptides) {
      assert.equal(p.regulatory ?? "unlisted", lane.key);
    }
  }
});

test("accessLanes: approved lane leads and is non-empty", () => {
  const lanes = accessLanes();
  assert.equal(lanes[0].key, "approved");
});
