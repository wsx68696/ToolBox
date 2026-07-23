import CodeFormatTool from '../components/CodeFormatTool';

export default function HtmlFormatTool() {
  return (
    <CodeFormatTool
      id="html-format"
      color="#f87171"
      mode="html"
      accept=".html,.htm"
      mock={'<!doctype html><html><head><title>Demo</title></head><body><h1>Hello Toolbox</h1><p>Format me.</p></body></html>'}
    />
  );
}
