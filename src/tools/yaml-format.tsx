import CodeFormatTool from '../components/CodeFormatTool';

export default function YamlFormatTool() {
  return (
    <CodeFormatTool
      id="yaml-format"
      color="#f472b6"
      mode="yaml"
      accept=".yaml,.yml"
      mock={'a  : test\nb:\n- b1\n-   b2\nc: {x: 1, y: 2}'}
    />
  );
}
