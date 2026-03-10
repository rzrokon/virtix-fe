import { Button, Col, Form, Input, Row, message } from 'antd';
import { postData } from '../../../scripts/api-service';

const { TextArea } = Input;

export default function ContactUs() {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const name = values['Name'];
      const workEmail = values['Work email'];
      const company = values['Company'];
      const industry = values['Industry'];
      const helpMessage = values['How can we help?'];

      const inferredName = name ? name : workEmail.split('@')[0];

      const payload = {
        name: inferredName,
        email: workEmail,
        company: company,
        industry: industry,
        message: helpMessage,
      };

      const res = await postData('api/billing/contact/submit/', payload, false);

      if (res?.data?.ok) {
        message.success(`Thanks! You request ID: ${res?.data?.id}`);
        form.resetFields();
      } else if (res?.error) {
        const errors = res?.errors;
        const msg = errors ? (Array.isArray(errors) ? errors.join(', ') : Object.values(errors).flat().join(', ')) : 'Submission failed.';
        message.error(msg);
      } else {
        message.error('Submission failed. Please try again.');
      }
    } catch {
      message.error('Submission failed. Please try again.');
    }
  };

  return (
    <section className="hero-section pt-32 pb-20 md:pt-40">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold leading-[120%] text-[#0C0900] md:text-5xl">
            Contact us
          </h1>
          <p className="mt-4 text-base leading-7 text-[#0C0900]/65 md:text-lg">
            Please tell us a little bit about your company and use case, and we&apos;ll be in touch soon.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-sm md:p-8">
          <Form
            size="large"
            layout="vertical"
            form={form}
            name="control-hooks"
            onFinish={onFinish}
          >
            <Row gutter={[16, 6]}>
              <Col xs={24} md={12}>
                <Form.Item name="Name" label="Name" rules={[{ required: true }]}>
                  <Input placeholder="Name" className="rounded-xl border-[#E5E7EB] px-4 py-3 shadow-none" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="Work email"
                  label="Work email"
                  rules={[
                    { required: true, message: 'Please enter your work email.' },
                    { type: 'email', message: 'Please enter a valid email.' },
                  ]}
                >
                  <Input placeholder="Work email" className="rounded-xl border-[#E5E7EB] px-4 py-3 shadow-none" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="Company" label="Company">
                  <Input placeholder="Company" className="rounded-xl border-[#E5E7EB] px-4 py-3 shadow-none" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="Industry" label="Industry">
                  <Input placeholder="Industry" className="rounded-xl border-[#E5E7EB] px-4 py-3 shadow-none" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="How can we help?"
                  label="How can we help?"
                  rules={[
                    { required: true, message: 'Please share what you need help with.' },
                    { min: 6, message: 'Please add a bit more detail.' },
                  ]}
                >
                  <TextArea
                    rows={5}
                    placeholder="Write your message"
                    className="rounded-xl border-[#E5E7EB] px-4 py-3 shadow-none"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="mb-0 mt-4">
              <Button
                type="primary"
                htmlType="submit"
                className="h-11 w-full rounded-xl border-0 bg-[#6200FF] text-base font-medium"
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </section>
  );
}
