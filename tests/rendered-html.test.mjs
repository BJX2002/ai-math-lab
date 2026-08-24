import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the completed educational homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /AI Math Lab/);
  assert.match(html, /See the maths/);
  assert.match(html, /Start with vectors/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /react-loading-skeleton|Your site is taking shape/);
});

test("renders the course path and a shareable module route", async () => {
  const courseResponse = await render("/courses");
  assert.equal(courseResponse.status, 200);
  assert.match(await courseResponse.text(), /Six ideas that make AI mathematics less mysterious/);

  const moduleResponse = await render("/modules/vectors");
  assert.equal(moduleResponse.status, 200);
  const moduleHtml = await moduleResponse.text();
  assert.match(moduleHtml, /Vectors: data with direction/);
  assert.match(moduleHtml, /INTERACTIVE CHECKPOINT/);
  assert.match(moduleHtml, /NUMPY CODE LAB/);
});
