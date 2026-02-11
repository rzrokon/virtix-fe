import { ConfigProvider, Steps } from 'antd';

const items = [
  {
    title: <span className="font-bold">Create agent</span>,
    icon: <img src="/assets/images/Home/image-95.png" alt="" />,
    description: (
      <span className="text-white text-[10px]">
        Set your agent’s name, tone, and purpose. Define how it represents your brand and interacts with users.
      </span>
    ),
  },
  {
    title: <span className="font-bold">Connect your data</span>,
    icon: <img src="/assets/images/Home/image-96.png" alt="" />,
    description: (
      <span className="text-white text-[10px]">
        Upload docs, add site links, and connect product/service info so answers stay accurate, consistent, and on-brand.
      </span>
    ),
  },
  {
    title: <span className="font-bold">Embed & launch</span>,
    icon: <img src="/assets/images/Home/image-97.png" alt="" />,
    description: (
      <span className="text-white text-[10px]">
        Copy the widget code and add it to your site. Go live and let your agent start engaging users instantly.
      </span>
    ),
  },
];

export default function BuildAgent() {
  return (
    <div className="flex flex-col items-center gap-10 bg-[#000B41] py-20">
      <div>
        <h2 className="text-4xl font-bold text-white">Build an AI agent in 3 steps</h2>
        <p className="text-white text-center">No code required — connect, customize, and go live.</p>
      </div>

      <div className="w-5xl text-white">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#fff',
              colorInfo: '#0ea5e9',
              colorText: '#fff',
            },
          }}
        >
          <Steps current={3} percent={60} labelPlacement="vertical" items={items} />
        </ConfigProvider>
      </div>
    </div>
  );
}