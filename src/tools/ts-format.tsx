import CodeFormatTool from '../components/CodeFormatTool';

export default function TsFormatTool() {
  return (
    <CodeFormatTool
      id="ts-format"
      color="#818cf8"
      mode="typescript"
      accept=".ts,.tsx"
      mock={"interface MyInterface {\n  foo(): string,\n  bar: Array<number>,\n}\n\nexport abstract class Foo implements MyInterface {\n  foo() {\n            return 'hello'\n      }\n  get bar() {\n    return [  1,\n\n      2, 3,\n    ]\n  }\n}\n"}
    />
  );
}
