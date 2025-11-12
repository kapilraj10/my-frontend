import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Card } from 'antd';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchClients() {
  const resp = await fetch(`${API_BASE}/api/clients`, { headers: { ...authHeaders() } });
  if (!resp.ok) throw new Error('Failed to load clients');
  return resp.json();
}
async function createClient(values) {
  const resp = await fetch(`${API_BASE}/api/clients`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(values) });
  if (!resp.ok) throw new Error('Failed to create');
  return resp.json();
}
async function updateClient(id, values) {
  const resp = await fetch(`${API_BASE}/api/clients/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(values) });
  if (!resp.ok) throw new Error('Failed to update');
  return resp.json();
}
async function deleteClient(id) {
  const resp = await fetch(`${API_BASE}/api/clients/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
  if (!resp.ok) throw new Error('Failed to delete');
  return true;
}

export default function Clients() {
  const qc = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const createMut = useMutation({ mutationFn: createClient, onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); message.success('Client added'); setOpen(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, values }) => updateClient(id, values), onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); message.success('Client updated'); setOpen(false); } });
  const deleteMut = useMutation({ mutationFn: deleteClient, onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); message.success('Client deleted'); } });

  const columns = useMemo(() => [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Company', dataIndex: 'company' },
    { title: 'Contact', dataIndex: 'contactName' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => { setEditing(record); form.setFieldsValue(record); setOpen(true); }}>Edit</Button>
          <Popconfirm title="Delete client?" onConfirm={() => deleteMut.mutate(record._id)}>
            <Button size="small" danger loading={deleteMut.isPending}>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ], [deleteMut, form]);

  const onSubmit = () => {
    form.validateFields().then(values => {
      if (editing) {
        updateMut.mutate({ id: editing._id, values });
      } else {
        createMut.mutate(values);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Clients</h2>
        <Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>Add Client</Button>
      </div>
      <Card>
        <Table loading={isLoading || isFetching} dataSource={data} rowKey="_id" columns={columns} />
      </Card>

      <Modal open={open} title={editing ? 'Edit Client' : 'Add Client'} onCancel={() => setOpen(false)} onOk={onSubmit} confirmLoading={createMut.isPending || updateMut.isPending}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Name required' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Company" name="company">
            <Input />
          </Form.Item>
          <Form.Item label="Contact Name" name="contactName">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Invalid email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
