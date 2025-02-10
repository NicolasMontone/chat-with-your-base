'use client'

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { Label } from 'recharts'
import { transformDataForMultiLineChart } from '@/lib/rechart-format'
import type { Config, Result } from '@/lib/chart'

const chartTypes = ['bar', 'line', 'area', 'pie', 'scatter'] as const

function toTitleCase(str: string): string {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
const colors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
]

export function DynamicChart({
  chartData,
  chartConfig: initialConfig,
}: {
  chartData: Result[]
  chartConfig: Config
}) {
  const [chartConfig, setChartConfig] = useState<Config>(initialConfig)

  const handleChartTypeChange = (type: (typeof chartTypes)[number]) => {
    setChartConfig((prev) => ({ ...prev, type }))
  }

  const renderChart = () => {
    if (!chartData || !chartConfig) return <div>No chart data</div>
    const parsedChartData = chartData.map((item) => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const parsedItem: { [key: string]: any } = {}
      for (const [key, value] of Object.entries(item)) {
        parsedItem[key] = Number.isNaN(Number(value)) ? value : Number(value)
      }
      return parsedItem
    })

    const processChartData = (data: Result[], chartType: string) => {
      if (chartType === 'bar' || chartType === 'pie') {
        if (data.length <= 8) {
          return data
        }

        const subset = data.slice(0, 20)
        return subset
      }
      return data
    }

    const processedData = processChartData(parsedChartData, chartConfig.type)

    switch (chartConfig.type) {
      case 'bar':
        return (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xKey}>
              <Label
                value={toTitleCase(chartConfig.xKey)}
                offset={0}
                position="insideBottom"
              />
            </XAxis>
            <YAxis>
              <Label
                value={toTitleCase(chartConfig.yKeys[0])}
                angle={-90}
                position="insideLeft"
              />
            </YAxis>
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && <Legend />}
            {chartConfig.yKeys.map((key: string, index: number) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        )
      case 'line': {
        const { data, xAxisField, lineFields } = transformDataForMultiLineChart(
          processedData,
          chartConfig
        )
        const useTransformedData =
          chartConfig.multipleLines &&
          chartConfig.measurementColumn &&
          chartConfig.yKeys.includes(chartConfig.measurementColumn)

        return (
          <LineChart data={useTransformedData ? data : processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={useTransformedData ? chartConfig.xKey : chartConfig.xKey}
            >
              <Label
                value={toTitleCase(
                  useTransformedData ? xAxisField : chartConfig.xKey
                )}
                offset={0}
                position="insideBottom"
              />
            </XAxis>
            <YAxis>
              <Label
                value={toTitleCase(chartConfig.yKeys[0])}
                angle={-90}
                position="insideLeft"
              />
            </YAxis>
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && <Legend />}
            {useTransformedData
              ? lineFields.map((key: string, index: number) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index % colors.length]}
                  />
                ))
              : chartConfig.yKeys.map((key: string, index: number) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index % colors.length]}
                  />
                ))}
          </LineChart>
        )
      }
      case 'area':
        return (
          <AreaChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && <Legend />}
            {chartConfig.yKeys.map((key: string, index: number) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                fill={colors[index % colors.length]}
                stroke={colors[index % colors.length]}
              />
            ))}
          </AreaChart>
        )
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={processedData}
              dataKey={chartConfig.yKeys[0]}
              nameKey={chartConfig.xKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
            >
              {processedData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && <Legend />}
          </PieChart>
        )
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xKey}>
              <Label
                value={toTitleCase(chartConfig.xKey)}
                offset={0}
                position="insideBottom"
              />
            </XAxis>
            <YAxis>
              <Label
                value={toTitleCase(chartConfig.yKeys[0])}
                angle={-90}
                position="insideLeft"
              />
            </YAxis>
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && <Legend />}
            {chartConfig.yKeys.map((key: string, index: number) => (
              <Scatter
                key={key}
                name={toTitleCase(key)}
                data={processedData}
                fill={colors[index % colors.length]}
                line={false}
                shape="circle"
                dataKey={key}
              />
            ))}
          </ScatterChart>
        )
      default:
        return <div>Unsupported chart type: {chartConfig.type}</div>
    }
  }

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{chartConfig.title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Chart Type:</span>
          <Select value={chartConfig.type} onValueChange={handleChartTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              {chartTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {toTitleCase(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {chartConfig && chartData.length > 0 && (
        <ChartContainer
          config={chartConfig.yKeys.reduce(
            (
              acc: { [key: string]: { label: string; color: string } },
              key: string,
              index: number
            ) => {
              acc[key] = {
                label: key,
                color: colors[index % colors.length],
              }
              return acc
            },
            {} as Record<string, { label: string; color: string }>
          )}
          className="h-[320px] w-full"
        >
          {renderChart()}
        </ChartContainer>
      )}
      <div className="w-full text-wrap">
        <p className="mt-4 text-sm">{chartConfig.description}</p>
        <p className="mt-4 text-sm">{chartConfig.takeaway}</p>
      </div>
    </div>
  )
}
