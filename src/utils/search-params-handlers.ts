/**
 * Helper function to create groupBy URLSearchParams.
 */
export function createGroupByParams(groupBy?: string): URLSearchParams | undefined {
  return groupBy ? new URLSearchParams({ groupBy }) : undefined
}

/**
 * Helper function to merge search parameters with groupBy parameters.
 */
export function mergeSearchParams(
  searchParameters: URLSearchParams | undefined,
  groupByParams: URLSearchParams | undefined,
): URLSearchParams {
  const finalParams = searchParameters || new URLSearchParams()

  if (groupByParams) {
    groupByParams.forEach((value, key) => {
      finalParams.append(key, value)
    })
  }

  return finalParams
}

/**
 * Helper function to build search parameters with optional groupBy.
 */
export function buildSearchParams(searchParams: URLSearchParams | undefined, groupBy?: string): URLSearchParams {
  const groupByParams = createGroupByParams(groupBy)
  return mergeSearchParams(searchParams, groupByParams)
}
