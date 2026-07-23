import ChartTool from '../components/ChartTool';

export default function ChartRadarTool() {
  return (
    <ChartTool
      id="chart-radar"
      color="#818cf8"
      kind="radar"
      defaultTitle="Radar Chart"
      defaultCategories="Speed, Reliability, Comfort, Safety, Efficiency"
      defaultData={`{
  "Product A": [80, 70, 90, 85, 75],
  "Product B": [60, 85, 70, 90, 80]
}`}
    />
  );
}
