import { Spin, Table } from 'antd';
import { useMemo } from 'react';
import { CheckIcon, CloseIcon } from '../../common/icons';

export default function ComparePlans({ plans = [], loading = false }) {
  const { columns, data } = useMemo(() => {
    // fallback empty
    if (!plans?.length) {
      return { columns: [], data: [] };
    }

    // 1) columns: Features + each plan name
    const cols = [
      {
        title: 'Features',
        dataIndex: 'name',
        key: 'name',
        width: 220,
        render: text => <span>{text}</span>,
      },
      ...plans.map((p) => ({
        title: p.name, // Free/Business/Enterprise based on backend
        key: p.code,
        width: 140,
        render: (_, record) =>
          record[p.code] ? <CheckIcon /> : <CloseIcon />,
      })),
    ];

    // 2) rows based on known boolean features
    const featureRows = [
      { key: 'lead_gen', name: 'Lead Generation' },
      { key: 'booking', name: 'Booking System' },
      { key: 'complaints', name: 'Complaints Management' },
      { key: 'products_orders', name: 'Products & Orders' },
      { key: 'offers', name: 'Special Offers' },
    ];

    const rows = featureRows.map((f) => {
      const row = { key: f.key, name: f.name };
      plans.forEach((p) => {
        row[p.code] = !!p[f.key];
      });
      return row;
    });

    return { columns: cols, data: rows };
  }, [plans]);

  return (
    <section className="hero-section py-10">
      <div className="container overflow-hidden">
        <div className="space-y-8 text-center ">
          <div className='mx-auto max-w-3xl space-y-4 px-2'>
            <h1 className="text-3xl sm:text-4xl md:text-5xl leading-[120%] text-[#0C0900] font-semibold">
              Compare plans
            </h1>

            <p className="text-sm sm:text-base">
              Compare features across plans and choose what fits your business.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          ) : (
            <div className="w-full overflow-x-auto pb-2">
              <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                scroll={{ x: 680 }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
