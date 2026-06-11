import { useState } from "react";
import { Button, Form, Input, Modal, Select, message } from "antd";
import { postData } from "../../scripts/api-service";
import { SUPPORT_TICKETS } from "../../scripts/api";

const { TextArea } = Input;

const DEPARTMENTS = [
  { label: "General Inquiry", value: "general" },
  { label: "Billing & Payments", value: "billing" },
  { label: "Technical Support", value: "technical" },
  { label: "Sales", value: "sales" },
  { label: "Feature Request", value: "feature" },
  { label: "Other", value: "other" },
];

export default function SubmitTicketModal({ open, onClose, onSuccess, prefillEmail = "" }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await postData(SUPPORT_TICKETS, values);
      if (res?.error || res?.errors) {
        message.error(res?.errors?.detail || "Failed to submit ticket.");
        return;
      }
      message.success(`Ticket ${res?.ticket_number || ""} submitted! Check your email for confirmation.`);
      form.resetFields();
      onSuccess?.(res);
    } catch {
      message.error("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Submit a Support Ticket"
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      destroyOnHidden
    >
      <p className="text-sm text-gray-500 mb-5">
        Describe your issue and our team will get back to you via email.
      </p>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ department: "general", customer_email: prefillEmail }}
      >
        <Form.Item
          name="customer_name"
          label="Your Name"
        >
          <Input placeholder="John Smith" />
        </Form.Item>

        <Form.Item
          name="customer_email"
          label="Email Address"
          rules={[
            { required: true, message: "Email is required." },
            { type: "email", message: "Enter a valid email." },
          ]}
        >
          <Input placeholder="you@example.com" />
        </Form.Item>

        <Form.Item name="department" label="Department">
          <Select options={DEPARTMENTS} />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: "Subject is required." }]}
        >
          <Input placeholder="Brief summary of your issue" maxLength={200} showCount />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please describe your issue." }]}
        >
          <TextArea
            rows={5}
            placeholder="Please provide as much detail as possible…"
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Submit Ticket
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
