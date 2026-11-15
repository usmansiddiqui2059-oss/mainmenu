export {};
// Order is intentional: each stage consumes the preceding stage's output.
await import("./prepare-art");
await import("./build");
await import("./portraits");
await import("./stills");
await import("./design-review");
await import("./review");
await import("./preview");

await import("./adapter");
