import CodeFormatTool from '../components/CodeFormatTool';

export default function CssFormatTool() {
  return (
    <CodeFormatTool
      id="css-format"
      color="#4ade80"
      mode="css"
      accept=".css"
      mock={'.a{position:absolute;box-sizing:border-box;min-width:100%;}.a:focus{box-shadow:inset 0 0 0 2px #5E9ED6;outline:none;}'}
    />
  );
}
