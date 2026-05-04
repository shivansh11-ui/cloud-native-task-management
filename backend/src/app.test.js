const assert = require("node:assert");
const test = require("node:test");
const app = require("./app");

test("health endpoint is available", async () => {
  const server = app.listen(0);
  const port = server.address().port;
  const response = await fetch(`http://localhost:${port}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  server.close();
});
