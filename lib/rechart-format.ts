import type { Config } from './chart'

type InputDataPoint = Record<string, string | number>

interface TransformedDataPoint {
  [key: string]: string | number | null
}

interface TransformationResult {
  data: TransformedDataPoint[]
  xAxisField: string
  lineFields: string[]
}

export function transformDataForMultiLineChart(
  data: InputDataPoint[],
  chartConfig: Config
): TransformationResult {
  const { xKey, lineCategories, measurementColumn } = chartConfig

  const fields = Object.keys(data[0])

  const xAxisField = xKey ?? 'year' // Assuming 'year' is always the x-axis
  const lineField =
    fields.find((field) =>
      lineCategories?.includes(data[0][field] as string)
    ) || ''

  const xAxisValues = Array.from(
    new Set(data.map((item) => String(item[xAxisField])))
  )

  const transformedData: TransformedDataPoint[] = xAxisValues.map((xValue) => {
    const dataPoint: TransformedDataPoint = { [xAxisField]: xValue }

    if (!lineCategories) {
      return dataPoint
    }

    for (const category of lineCategories) {
      const matchingItem = data.find(
        (item) =>
          String(item[xAxisField]) === xValue &&
          String(item[lineField]) === category
      )
      dataPoint[category] = matchingItem
        ? matchingItem[measurementColumn ?? '']
        : null
    }

    return dataPoint
  })

  transformedData.sort((a, b) => Number(a[xAxisField]) - Number(b[xAxisField]))

  return {
    data: transformedData,
    xAxisField,
    lineFields: lineCategories ?? [],
  }
}
