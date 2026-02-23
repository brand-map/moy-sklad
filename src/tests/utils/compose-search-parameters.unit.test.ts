import { describe, expect, test } from "bun:test"

import { composeSearchParameters } from "../../utils/compose-search-parameters"

describe("composeSearchParameters (unit)", () => {
  test("returns undefined when no options provided", () => {
    expect(composeSearchParameters({})).toBeUndefined()
  })

  test("serializes pagination, namedfilter and search", () => {
    const params = composeSearchParameters({
      pagination: { limit: 10, offset: 20 },
      namedfilter: "all",
      search: "milk",
    })

    expect(Object.fromEntries(params?.entries() ?? [])).toEqual({
      namedfilter: "all",
      limit: "10",
      offset: "20",
      search: "milk",
    })
  })

  test("serializes expand and applies limit=100 when limit not provided", () => {
    const params = composeSearchParameters({
      expand: { images: true, productFolder: { owner: true } },
    })

    expect(Object.fromEntries(params?.entries() ?? [])).toEqual({
      limit: "100",
      expand: "images,productFolder.owner",
    })
  })

  test("throws when expand nesting depth exceeds 3", () => {
    expect(() =>
      composeSearchParameters({
        expand: {
          a: { b: { c: { d: true } } },
        },
      }),
    ).toThrow("Expand depth cannot be more than 3")
  })

  test("serializes order in string/object/array forms", () => {
    expect(Object.fromEntries(composeSearchParameters({ order: "name" })?.entries() ?? [])).toEqual({ order: "name" })

    expect(
      Object.fromEntries(composeSearchParameters({ order: { field: "name", direction: "desc" } })?.entries() ?? []),
    ).toEqual({ order: "name,desc" })

    expect(
      Object.fromEntries(
        composeSearchParameters({
          order: ["name", { field: "code", direction: "asc" }],
        })?.entries() ?? [],
      ),
    ).toEqual({ order: "name;code,asc" })
  })

  test("serializes filters for primitive and array values", () => {
    const params = composeSearchParameters({
      filter: {
        name: "Tea",
        archived: false,
        ids: ["1", "2"],
      },
    })

    expect(Object.fromEntries(params?.entries() ?? [])).toEqual({
      filter: "name=Tea;archived=false;ids=1;ids=2",
    })
  })

  test("skips undefined filter values", () => {
    const params = composeSearchParameters({
      filter: {
        name: undefined,
        code: "A-1",
      },
    })

    expect(Object.fromEntries(params?.entries() ?? [])).toEqual({
      filter: "code=A-1",
    })
  })

  test("serializes filters with operator syntax", () => {
    const params = composeSearchParameters({
      filter: {
        f1: { eq: ["a", "b"] },
        f2: { ne: "x" },
        f3: { gt: 10 },
        f4: { gte: 11 },
        f5: { lt: 20 },
        f6: { lte: 21 },
        f7: { like: "abc" },
        f8: { sw: "ab" },
        f9: { ew: "bc" },
        f10: { isNull: true },
        f11: { isNotNull: true },
      },
    })

    expect(Object.fromEntries(params?.entries() ?? [])).toEqual({
      filter: "f1=a;f1=b;f2!=x;f3>10;f4>=11;f5<20;f6<=21;f7~abc;f8~=ab;f9=~bc;f10=;f11!=",
    })
  })

  test("appends passthrough options via String(value)", () => {
    const params = composeSearchParameters({
      fields: ["a", "b"],
      namedfilter: undefined,
    } as any)

    expect(Object.fromEntries(params?.entries() ?? [])).toEqual({
      fields: "a,b",
    })
  })

  test("does not serialize null/undefined passthrough values", () => {
    const params = composeSearchParameters({
      fields: undefined,
      namedfilter: undefined,
      pagination: undefined,
      expand: undefined,
      order: undefined,
      search: undefined,
      filter: undefined,
      customA: undefined,
      customB: null,
      customC: 0,
    } as any)

    expect(Object.fromEntries(params?.entries() ?? [])).toEqual({
      customC: "0",
    })
  })
})
