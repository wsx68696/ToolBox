import { memo } from 'react';

const AuroraBackground = memo(function AuroraBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden">
      <div className="aurora-orb left-[-8rem] top-[-8rem] h-80 w-80 bg-[#818cf8]" />
      <div className="aurora-orb right-[-7rem] top-[-5rem] h-96 w-96 bg-[#a855f7]" />
      <div className="aurora-orb bottom-[-8rem] left-[-4rem] h-96 w-96 bg-[#f472b6]" />
      <div className="aurora-orb right-[12%] top-[34%] h-80 w-80 bg-[#22d3ee]" />
    </div>
  );
});

export default AuroraBackground;
