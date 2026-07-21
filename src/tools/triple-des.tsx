import BlockCipherTool from '../components/BlockCipherTool';

export default function TripleDesTool() {
  return <BlockCipherTool id="triple-des" color="#fbbf24" algorithm="TripleDES" keyBytes={[16, 24]} />;
}
