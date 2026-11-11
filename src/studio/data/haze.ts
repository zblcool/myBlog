/**
 * Hazeglow config for the animated background behind the home page's Products, Live demos and
 * case study sections (HazeZone.astro). Exported from the Hazeglow editor; dark steel with a
 * bronze glow, matching the booth hall above it.
 */
import { parseConfig } from "hazeglow/core";

export const hazeConfig = parseConfig({
  version: 1,
  seed: 3054373361,
  shape: "mesh",
  center: [0.5, 0.489],
  size: [1, 0.505],
  roundness: 0.566,
  softness: 0.7,
  rotation: 0,
  rampDirection: 0.988,
  angle: 274,
  warp: 0.2,
  warpScale: 1,
  palette: ["#090b0e", "#000001", "#111416", "#22262b", "#815932", "#c0c8d2", "#af9177", "#383c3f", "#1e2428", "#121820"],
  background: "#120a08",
  mesh: [
    [0.031, 0.025, "#090b0e"],
    [0.582, 0.244, "#000001"],
    [0.969, 0.275, "#111416"],
    [0.597, 0.321, "#605d5a"],
    [0.338, 0.437, "#22262b"],
    [0.094, 0.475, "#815932"],
    [0.531, 0.575, "#c0c8d2"],
    [0.906, 0.625, "#af9177"],
    [0.969, 0.625, "#2a6895"],
    [0.469, 0.825, "#383c3f"],
    [0.969, 0.875, "#1e2428"],
    [0.219, 0.975, "#121820"],
  ],
  grain: 0.26,
  motion: "drift",
  speed: 1,
  loop: 0,
  hover: 0,
  hoverMode: "pull",
  effect: "none",
  effectSize: 8,
  effectAmount: 0.5,
});
