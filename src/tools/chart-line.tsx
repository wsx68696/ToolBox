import ChartTool from '../components/ChartTool';

export default function ChartLineTool() {
  return (
    <ChartTool
      id="chart-line"
      color="#22d3ee"
      kind="line"
      defaultTitle="Line Chart"
      defaultData={`{
  "Series A": [120, 132, 101, 134, 90, 230, 210],
  "Series B": [220, 182, 191, 234, 290, 330, 310],
  "Series C": [150, 232, 201, 154, 190, 330, 410]
}`}
    />
  );
}
