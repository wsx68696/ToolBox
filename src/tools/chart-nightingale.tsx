import ChartTool from '../components/ChartTool';

export default function ChartNightingaleTool() {
  return (
    <ChartTool
      id="chart-nightingale"
      color="#f472b6"
      kind="pie"
      defaultTitle="Nightingale Chart"
      defaultData={`[
  { "name": "Rose 1", "value": 40 },
  { "name": "Rose 2", "value": 38 },
  { "name": "Rose 3", "value": 32 },
  { "name": "Rose 4", "value": 30 },
  { "name": "Rose 5", "value": 28 },
  { "name": "Rose 6", "value": 26 }
]`}
    />
  );
}
