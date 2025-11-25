import { Table } from 'antd';
import { CheckIcon, CloseIcon } from '../../common/icons';

const columns = [
  {
    title: 'Features',
    dataIndex: 'name',
    key: 'name',
    render: text => <span>{text}</span>,
  },
  {
    title: 'Free',
    key: 'action',
    width: 100,
    render: (_, record) => (
      record.free ? <CheckIcon /> : <CloseIcon />
    ),
  },
  {
    title: 'Studio',
    key: 'action',
    width: 100,
    render: (_, record) => (
      record.studio ? <CheckIcon /> : <CloseIcon />
    ),
  },
  {
    title: 'Enterprise',
    key: 'action',
    width: 100,
    render: (_, record) => (
      record.enterprise ? <CheckIcon /> : <CloseIcon />
    ),
  },
];
const data = [
  {
    key: '1',
    name: 'Features name',
    free: false,
    studio: true,
    enterprise: true,
  },
  {
    key: '2',
    name: 'Features name',
    free: true,
    studio: false,
    enterprise: true,
  },
  {
    key: '3',
    name: 'Features name',
    free: true,
    studio: true,
    enterprise: false,
  },
];
export default function ComparePlans() {
  return (
    <section className="hero-section py-20">
      <div className="container ">
        <div className="space-y-8 text-center ">
          <div className='md:w-3xl mx-auto space-y-6'>
            <h1 className="text-6xl leading-[120%] text-[#0C0900] font-semibold">
              Compare plans
            </h1>

            <p>
              Use Jitter for free with your entire team. Upgrade to export your files in HD, remove the Jitter watermark, unlock unlimited folders, and more.
            </p>
          </div>

          <Table columns={columns} dataSource={data} pagination={false} />
        </div>
      </div>
    </section>
  )
}
