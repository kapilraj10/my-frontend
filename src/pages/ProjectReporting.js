import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, createProject, updateProject, deleteProject, fetchClients, fetchTeam } from "../services/api";
import { Table, Tag, Progress, Card, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message } from "antd";
import { Line } from "@ant-design/plots";
import { Bar } from "react-chartjs-2";
import 'chart.js/auto';
import dayjs from 'dayjs';

export default function ProjectReporting() {
  const qc = useQueryClient();

  // Queries
  const { data: projects = [], isLoading, refetch, isFetching } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: fetchClients });
  const { data: team = [] } = useQuery({ queryKey: ["team"], queryFn: fetchTeam });

  // Modal & Form state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // Mutations
  const createMut = useMutation({ mutationFn: createProject, onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); message.success('Project created'); setOpen(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, values }) => updateProject(id, values), onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); message.success('Project updated'); setOpen(false); } });
  const deleteMut = useMutation({ mutationFn: deleteProject, onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); message.success('Project deleted'); } });

  // Table columns
  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Status", dataIndex: "status", render: (status) => <Tag>{status}</Tag> },
    { title: "Completion", dataIndex: "completionPercent", render: (val) => <Progress percent={parseFloat(val.toFixed(1))} size="small" /> },
    { title: "Start", dataIndex: "startDate" },
    { title: "End", dataIndex: "endDate" },
    { title: 'Priority', dataIndex: 'priority' },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => {
            setEditing(record);
            form.setFieldsValue({
              name: record.name,
              status: record.status,
              priority: record.priority,
              client: record.client?._id,
              team: record.team?.map(t => t._id),
              dates: [record.startDate ? dayjs(record.startDate) : null, record.endDate ? dayjs(record.endDate) : null],
              completionPercent: record.completionPercent
            });
            setOpen(true);
          }}>Edit</Button>

          <Popconfirm title="Delete project?" onConfirm={() => deleteMut.mutate(record._id)}>
            <Button size="small" danger loading={deleteMut.isLoading}>Delete</Button>
          </Popconfirm>

          {!record.archived && (
            <Popconfirm title="Archive project?" onConfirm={() => updateMut.mutate({ id: record._id, values: { archived: true } })}>
              <Button size="small">Archive</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  // Charts
  const chartData = projects.map(p => ({ project: p.name, completion: parseFloat(p.completionPercent.toFixed(1)) }));
  const lineConfig = { data: chartData, xField: "project", yField: "completion", point: { size: 5 }, smooth: true, yAxis: { max: 100 } };
  const barData = { labels: projects.map(p => p.name), datasets: [{ label: 'Completion %', data: projects.map(p => parseFloat(p.completionPercent.toFixed(1))), backgroundColor: 'rgba(59,130,246,0.5)', borderColor: 'rgba(59,130,246,1)', borderWidth: 1 }] };

  // Form submission
  const onSubmit = () => {
    form.validateFields().then(values => {
      const payload = {
        name: values.name,
        status: values.status,
        priority: values.priority,
        completionPercent: values.completionPercent || 0,
        client: values.client,
        team: values.team,
        startDate: values.dates?.[0]?.toISOString(),
        endDate: values.dates?.[1]?.toISOString()
      };
      if (editing) updateMut.mutate({ id: editing._id, values: payload });
      else createMut.mutate(payload);
    }).catch(info => {
      message.error('Please fix the form errors before submitting');
      console.log('Form errors:', info);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Project Reporting</h2>
        <Space>
          <Button loading={isFetching} onClick={() => refetch()}>Show Reports</Button>
          <Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>Add Project</Button>
        </Space>
      </div>

      {/* Projects table */}
      <Card>
        <Table loading={isLoading} dataSource={projects} columns={columns} rowKey="_id" pagination={false} />
      </Card>

      {/* Charts */}
      <Card title="Completion Overview (Line)"><Line {...lineConfig} /></Card>
      <Card title="Completion Overview (Bar)"><Bar data={barData} /></Card>

      {/* Modal */}
      <Modal open={open} title={editing ? 'Edit Project' : 'Add Project'} onCancel={() => setOpen(false)} onOk={onSubmit} confirmLoading={createMut.isLoading || updateMut.isLoading} width={700}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Name required' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Status" name="status" initialValue="Planned">
            <Select options={['Planned','In Progress','Completed','On-Hold'].map(s => ({ value: s }))} />
          </Form.Item>
          <Form.Item label="Priority" name="priority" initialValue="Medium">
            <Select options={['Low','Medium','High','Critical'].map(s => ({ value: s }))} />
          </Form.Item>
          <Form.Item label="Client" name="client">
            <Select allowClear options={clients.map(c => ({ label: c.name, value: c._id }))} />
          </Form.Item>
          <Form.Item label="Team Members" name="team">
            <Select mode="multiple" allowClear options={team.map(t => ({ label: t.name, value: t._id }))} />
          </Form.Item>
          <Form.Item label="Dates" name="dates">
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item label="Completion %" name="completionPercent">
            <Input type="number" min={0} max={100} step={0.1} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
