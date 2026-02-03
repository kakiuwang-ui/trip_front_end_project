'use client';

import { ReactNode } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface FeatureItemProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-2xl text-[#1677ff]">{icon}</div>
      <div>
        <Text strong className="block">{title}</Text>
        <Text type="secondary">{description}</Text>
      </div>
    </div>
  );
}
