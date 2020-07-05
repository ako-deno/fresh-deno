/*!
 * Based on https://github.com/jshttp/fresh/blob/master/test/fresh.js
 * Copyright(c) 2012 TJ Holowaychuk
 * Copyright(c) 2016-2017 Douglas Christopher Wilson
 * Copyright(c) 2020 Douglas Christian Norrman
 * MIT Licensed
 */
import { assert } from "https://deno.land/std@v0.57.0/testing/asserts.ts";
import fresh from "./mod.ts";
const { test } = Deno;

test("non-conditional GET: should be stale", () => {
  const reqHeaders = new Headers({});
  const resHeaders = new Headers({});
  assert(!fresh(reqHeaders, resHeaders));
});

//'when requested with If-None-Match'
//'when ETags match'
test("should be fresh", () => {
  const reqHeaders = new Headers({ "If-None-Match": '"foo"' });
  const resHeaders = new Headers({ "ETag": '"foo"' });
  assert(fresh(reqHeaders, resHeaders));
});

// 'when ETags mismatch'
test("should be stale", () => {
  const reqHeaders = new Headers({ "If-None-Match": '"foo"' });
  const resHeaders = new Headers({ "ETag": '"bar"' });
  assert(!fresh(reqHeaders, resHeaders));
});

// 'when at least one matches'
test("should be fresh", () => {
  const reqHeaders = new Headers({ "If-None-Match": ' "bar" , "foo"' });
  const resHeaders = new Headers({ "ETag": '"foo"' });
  assert(fresh(reqHeaders, resHeaders));
});

// 'when ETag is missing'
test("should be stale", () => {
  const reqHeaders = new Headers({ "If-None-Match": '"foo"' });
  const resHeaders = new Headers({});
  assert(!fresh(reqHeaders, resHeaders));
});

// 'when ETag is weak'
test("should be fresh on exact match", () => {
  const reqHeaders = new Headers({ "If-None-Match": 'W/"foo"' });
  const resHeaders = new Headers({ "ETag": 'W/"foo"' });
  assert(fresh(reqHeaders, resHeaders));
});
test("should be fresh on strong match", () => {
  const reqHeaders = new Headers({ "If-None-Match": 'W/"foo"' });
  const resHeaders = new Headers({ "ETag": '"foo"' });
  assert(fresh(reqHeaders, resHeaders));
});

// 'when ETag is strong'
test("should be fresh on exact match", () => {
  const reqHeaders = new Headers({ "If-None-Match": '"foo"' });
  const resHeaders = new Headers({ "ETag": '"foo"' });
  assert(fresh(reqHeaders, resHeaders));
});
test("should be fresh on weak match", () => {
  const reqHeaders = new Headers({ "If-None-Match": '"foo"' });
  const resHeaders = new Headers({ "ETag": 'W/"foo"' });
  assert(fresh(reqHeaders, resHeaders));
});

// 'when * is given'
test("should be fresh", () => {
  const reqHeaders = new Headers({ "If-None-Match": "*" });
  const resHeaders = new Headers({ "ETag": '"foo"' });
  assert(fresh(reqHeaders, resHeaders));
});
test("should get ignored if not only value", () => {
  const reqHeaders = new Headers({ "If-None-Match": '*, "bar"' });
  const resHeaders = new Headers({ "ETag": '"foo"' });
  assert(!fresh(reqHeaders, resHeaders));
});

// 'when requested with If-Modified-Since'
// 'when modified since the date'
test("should be stale", () => {
  const reqHeaders = new Headers(
    { "If-Modified-Since": "Sat, 01 Jan 2000 00:00:00 GMT" },
  );
  const resHeaders = new Headers(
    { "Last-Modified": "Sat, 01 Jan 2000 01:00:00 GMT" },
  );
  assert(!fresh(reqHeaders, resHeaders));
});

// 'when unmodified since the date'
test("should be fresh", () => {
  const reqHeaders = new Headers(
    { "If-Modified-Since": "Sat, 01 Jan 2000 01:00:00 GMT" },
  );
  const resHeaders = new Headers(
    { "Last-Modified": "Sat, 01 Jan 2000 00:00:00 GMT" },
  );
  assert(fresh(reqHeaders, resHeaders));
});

// 'when Last-Modified is missing'
test("should be stale", () => {
  const reqHeaders = new Headers(
    { "If-Modified-Since": "Sat, 01 Jan 2000 00:00:00 GMT" },
  );
  const resHeaders = new Headers({});
  assert(!fresh(reqHeaders, resHeaders));
});

//'with invalid If-Modified-Since date'
test("should be stale", () => {
  const reqHeaders = new Headers({ "If-Modified-Since": "foo" });
  const resHeaders = new Headers(
    { "Last-Modified": "Sat, 01 Jan 2000 00:00:00 GMT" },
  );
  assert(!fresh(reqHeaders, resHeaders));
});

//'with invalid Last-Modified date'
test("should be stale", () => {
  const reqHeaders = new Headers(
    { "If-Modified-Since": "Sat, 01 Jan 2000 00:00:00 GMT" },
  );
  const resHeaders = new Headers({ "Last-Modified": "foo" });
  assert(!fresh(reqHeaders, resHeaders));
});

// 'when requested with If-Modified-Since and If-None-Match'
// 'when both match'
test("should be fresh", () => {
  const reqHeaders = new Headers(
    {
      "If-None-Match": '"foo"',
      "If-Modified-Since": "Sat, 01 Jan 2000 01:00:00 GMT",
    },
  );
  const resHeaders = new Headers(
    { "ETag": '"foo"', "Last-Modified": "Sat, 01 Jan 2000 00:00:00 GMT" },
  );
  assert(fresh(reqHeaders, resHeaders));
});

// 'when only ETag matches'
test("should be stale", () => {
  const reqHeaders = new Headers(
    {
      "If-None-Match": '"foo"',
      "If-Modified-Since": "Sat, 01 Jan 2000 00:00:00 GMT",
    },
  );
  const resHeaders = new Headers(
    { "ETag": '"foo"', "Last-Modified": "Sat, 01 Jan 2000 01:00:00 GMT" },
  );
  assert(!fresh(reqHeaders, resHeaders));
});

// 'when only Last-Modified matches'
test("should be stale", () => {
  const reqHeaders = new Headers(
    {
      "If-None-Match": '"foo"',
      "If-Modified-Since": "Sat, 01 Jan 2000 01:00:00 GMT",
    },
  );
  const resHeaders = new Headers(
    { "ETag": '"bar"', "Last-Modified": "Sat, 01 Jan 2000 00:00:00 GMT" },
  );
  assert(!fresh(reqHeaders, resHeaders));
});

// 'when none match'
test("should be stale", () => {
  const reqHeaders = new Headers(
    {
      "If-None-Match": '"foo"',
      "If-Modified-Since": "Sat, 01 Jan 2000 00:00:00 GMT",
    },
  );
  const resHeaders = new Headers(
    { "ETag": '"bar"', "Last-Modified": "Sat, 01 Jan 2000 01:00:00 GMT" },
  );
  assert(!fresh(reqHeaders, resHeaders));
});

// 'when requested with Cache-Control: no-cache'
test("should be stale", () => {
  const reqHeaders = new Headers({ "Cache-Control": " no-cache" });
  const resHeaders = new Headers({});
  assert(!fresh(reqHeaders, resHeaders));
});

//'when ETags match'
test("should be stale", () => {
  const reqHeaders = new Headers(
    { "Cache-Control": " no-cache", "If-None-Match": '"foo"' },
  );
  const resHeaders = new Headers({ "ETag": '"foo"' });
  assert(!fresh(reqHeaders, resHeaders));
});

//'when unmodified since the date', () => {
test("should be stale", () => {
  const reqHeaders = new Headers(
    {
      "Cache-Control": " no-cache",
      "If-Modified-Since": "Sat, 01 Jan 2000 01:00:00 GMT",
    },
  );
  const resHeaders = new Headers(
    { "Last-Modified": "Sat, 01 Jan 2000 00:00:00 GMT" },
  );
  assert(!fresh(reqHeaders, resHeaders));
});
