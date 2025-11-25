import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  PlusOutlined,
  SwapOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tooltip,
  Upload
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CREATE_FILE, DELETE_FILE, GET_FILES, UPDATE_FILE } from '../../scripts/api';
import { deleteData, getData, patchData, postData } from '../../scripts/api-service';

const { Dragger } = Upload;

export default function ManageFiles() {
  const { id: agentId } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [replaceModalVisible, setReplaceModalVisible] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [replacingFile, setReplacingFile] = useState(null);
  const [uploadForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [replaceForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [replaceFileList, setReplaceFileList] = useState([]);

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, [agentId]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await getData(`${GET_FILES}?agent=${agentId}&ordering=file_name`);
      setFiles(response.results || response);
    } catch (error) {
      message.error('Failed to fetch files');
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFiles = async (values) => {
    if (fileList.length === 0) {
      message.error('Please select at least one file to upload');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('agent', agentId);
      formData.append('file_name', values.file_name);

      fileList.forEach((file) => {
        formData.append('upload', file.originFileObj);
      });

      await postData(CREATE_FILE, formData);
      message.success('Files uploaded successfully');
      setUploadModalVisible(false);
      uploadForm.resetFields();
      setFileList([]);
      fetchFiles();
    } catch (error) {
      message.error('Failed to upload files');
      console.error('Error uploading files:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFile = async (values) => {
    setSubmitting(true);
    try {
      await patchData(`${UPDATE_FILE}${editingFile.id}/`, {
        file_name: values.file_name
      });
      message.success('File name updated successfully');
      setEditModalVisible(false);
      editForm.resetFields();
      setEditingFile(null);
      fetchFiles();
    } catch (error) {
      message.error('Failed to update file name');
      console.error('Error updating file:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplaceFile = async () => {
    if (replaceFileList.length === 0) {
      message.error('Please select files to replace');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      replaceFileList.forEach((file) => {
        formData.append('upload', file.originFileObj);
      });

      await patchData(`${UPDATE_FILE}${replacingFile.id}/`, formData);
      message.success('File replaced successfully');
      setReplaceModalVisible(false);
      setReplaceFileList([]);
      setReplacingFile(null);
      fetchFiles();
    } catch (error) {
      message.error('Failed to replace file');
      console.error('Error replacing file:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteData(`${DELETE_FILE}${fileId}/`);
      message.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      message.error('Failed to delete file');
      console.error('Error deleting file:', error);
    }
  };

  const openEditModal = (file) => {
    setEditingFile(file);
    editForm.setFieldsValue({
      file_name: file.file_name
    });
    setEditModalVisible(true);
  };

  const openReplaceModal = (file) => {
    setReplacingFile(file);
    setReplaceModalVisible(true);
  };

  const uploadProps = {
    multiple: true,
    fileList: fileList,
    beforeUpload: () => false, // Prevent auto upload
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
  };

  const replaceUploadProps = {
    multiple: true,
    fileList: replaceFileList,
    beforeUpload: () => false,
    onChange: ({ fileList: newFileList }) => {
      setReplaceFileList(newFileList);
    },
    onRemove: (file) => {
      const index = replaceFileList.indexOf(file);
      const newFileList = replaceFileList.slice();
      newFileList.splice(index, 1);
      setReplaceFileList(newFileList);
    },
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toUpperCase();
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'file_name',
      key: 'file_name',
      render: (text, record) => (
        <div className="flex items-center space-x-2">
          <FileOutlined className="text-blue-500" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Name">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Replace Files">
            <Button
              type="text"
              icon={<SwapOutlined />}
              onClick={() => openReplaceModal(record)}
              className="text-orange-600 hover:text-orange-800"
            />
          </Tooltip>
          <Popconfirm
            title="Delete File"
            description="Are you sure you want to delete this file?"
            onConfirm={() => handleDeleteFile(record.id)}
            okText="Yes"
            cancelText="No"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-red-600 hover:text-red-800"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Manage Files
          </h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setUploadModalVisible(true)}
          >
            Upload Files
          </Button>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={files}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} files`,
            }}
          />
        </Spin>
      </Card>

      {/* Upload Files Modal */}
      <Modal
        title="Upload New Files"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          uploadForm.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={handleUploadFiles}
          className="mt-4"
        >
          <Form.Item
            name="file_name"
            label="File Name"
            rules={[{ required: true, message: 'Please enter a file name' }]}
          >
            <Input placeholder="Enter file name" />
          </Form.Item>

          <Form.Item
            label="Select Files"
            required
          >
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to this area to upload</p>
              <p className="ant-upload-hint">
                Support for multiple file upload. You can select multiple files at once.
              </p>
            </Dragger>
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setUploadModalVisible(false);
                uploadForm.resetFields();
                setFileList([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={fileList.length === 0}
            >
              Upload Files
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit File Name Modal */}
      <Modal
        title="Edit File Name"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setEditingFile(null);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditFile}
          className="mt-4"
        >
          <Form.Item
            name="file_name"
            label="File Name"
            rules={[{ required: true, message: 'Please enter a file name' }]}
          >
            <Input placeholder="Enter file name" />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                editForm.resetFields();
                setEditingFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              Update Name
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Replace Files Modal */}
      <Modal
        title={`Replace Files for: ${replacingFile?.file_name}`}
        open={replaceModalVisible}
        onCancel={() => {
          setReplaceModalVisible(false);
          setReplaceFileList([]);
          setReplacingFile(null);
        }}
        footer={null}
        width={600}
      >
        <div className="mt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Files
            </label>
            <Dragger {...replaceUploadProps}>
              <p className="ant-upload-drag-icon">
                <SwapOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to replace existing files</p>
              <p className="ant-upload-hint">
                The selected files will replace the current files.
              </p>
            </Dragger>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setReplaceModalVisible(false);
                setReplaceFileList([]);
                setReplacingFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleReplaceFile}
              loading={submitting}
              disabled={replaceFileList.length === 0}
            >
              Replace Files
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
