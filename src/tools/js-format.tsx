import CodeFormatTool from '../components/CodeFormatTool';

export default function JsFormatTool() {
  return (
    <CodeFormatTool
      id="js-format"
      color="#fbbf24"
      mode="javascript"
      accept=".js,.mjs,.cjs"
      mock={'function fibonacci(n){if(n<=1){return n}else{return fibonacci(n-1)+fibonacci(n-2)}}for(let i=0;i<10;i++){console.log(fibonacci(i))}'}
    />
  );
}
