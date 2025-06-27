import React from 'react';

const Visite2 = ({ agentId }: { agentId: string }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Visite 2</h2>
      <p>محتوى الزيارة الثانية للمريض (agentId: {agentId}) (يمكنك تخصيص هذا القسم لاحقاً).</p>
    </div>
  );
};

export default Visite2;
