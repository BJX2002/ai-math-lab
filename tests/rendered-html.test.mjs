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
  assert.match(html, /Teach me like I’m new/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /react-loading-skeleton|Your site is taking shape/);
});

test("renders the course path and a shareable module route", async () => {
  const courseResponse = await render("/courses");
  assert.equal(courseResponse.status, 200);
  assert.match(await courseResponse.text(), /Start from zero\. Build one idea at a time/);

  const moduleResponse = await render("/modules/vectors");
  assert.equal(moduleResponse.status, 200);
  const moduleHtml = await moduleResponse.text();
  assert.match(moduleHtml, /Vectors: data with direction/);
  assert.match(moduleHtml, /PLAY WITH THE IDEA/);
  assert.match(moduleHtml, /YOUR FIRST LOOK AT PYTHON/);
  assert.match(moduleHtml, /PICTURE THE IDEA/);
  assert.match(moduleHtml, /Ready\? Show me the maths/);
});

test("renders the absolute-beginner neural network introduction", async () => {
  const response = await render("/start-here");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /What does AI actually do/);
  assert.match(html, /MEET ONE TINY NEURON/);
  assert.match(html, /Practise, check, adjust, repeat/);
  assert.match(html, /neural-network-beginner\.png/);
});
