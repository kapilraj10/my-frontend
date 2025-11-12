import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Card } from 'antd';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchTeam() {
  const resp = await fetch(`${API_BASE}/api/team`, { headers: { ...authHeaders() } });
  if (!resp.ok) throw new Error('Failed to load team');
  return resp.json();
}
async function createMember(values) {
  const resp = await fetch(`${API_BASE}/api/team`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(values) });
  if (!resp.ok) throw new Error('Failed to create member');
  return resp.json();
}
async function updateMember(id, values) {
  const resp = await fetch(`${API_BASE}/api/team/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(values) });
  if (!resp.ok) throw new Error('Failed to update member');
  return resp.json();
}
async function deleteMember(id) {
  const resp = await fetch(`${API_BASE}/api/team/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
  if (!resp.ok) throw new Error('Failed to delete member');
  return true;
}

export default function Team() {
  const qc = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({ queryKey: ['team'], queryFn: fetchTeam });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const createMut = useMutation({ mutationFn: createMember, onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); message.success('Member added'); setOpen(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, values }) => updateMember(id, values), onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); message.success('Member updated'); setOpen(false); } });
  const deleteMut = useMutation({ mutationFn: deleteMember, onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); message.success('Member deleted'); } });

  const columns = useMemo(() => [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Role', dataIndex: 'role' },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => { setEditing(record); form.setFieldsValue(record); setOpen(true); }}>Edit</Button>
          <Popconfirm title="Delete member?" onConfirm={() => deleteMut.mutate(record._id)}>
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
        <h2 className="text-xl font-semibold">Team Members</h2>
        <Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>Add Member</Button>
      </div>
      <Card>
        <Table loading={isLoading || isFetching} dataSource={data} rowKey="_id" columns={columns} />
      </Card>

      <Modal open={open} title={editing ? 'Edit Member' : 'Add Member'} onCancel={() => setOpen(false)} onOk={onSubmit} confirmLoading={createMut.isPending || updateMut.isPending}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Name required' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Invalid email' }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Role" name="role" initialValue="Developer">
            <Select options={['Developer','Tester','Manager','Designer','DevOps','Analyst','Other'].map(r => ({ value: r }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
