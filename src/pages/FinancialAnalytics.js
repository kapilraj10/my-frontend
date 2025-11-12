import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFinancials, fetchFinanceRaw, createFinance, deleteFinance, fetchProjects } from "../services/api";
import { Card, Table, Statistic, Row, Col, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, message } from "antd";
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function FinancialAnalytics() {
  const qc = useQueryClient();
  const { data, isLoading, refetch, isFetching } = useQuery({ queryKey: ["finance"], queryFn: fetchFinancials });
  const { data: raw } = useQuery({ queryKey: ['financeRaw'], queryFn: fetchFinanceRaw });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const createMut = useMutation({ mutationFn: createFinance, onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance'] }); qc.invalidateQueries({ queryKey: ['financeRaw'] }); message.success('Entry added'); setOpen(false); } });
  const deleteMut = useMutation({ mutationFn: (id) => deleteFinance(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance'] }); qc.invalidateQueries({ queryKey: ['financeRaw'] }); message.success('Entry deleted'); } });

  // Compute totals
  const totalIncome = data?.reduce((sum, item) => sum + item.income, 0) ?? 0;
  const totalExpenses = data?.reduce((sum, item) => sum + item.expenses, 0) ?? 0;
  const totalProfit = totalIncome - totalExpenses;

  // Table columns
  const columns = [
    {
      title: "Project",
      dataIndex: "projectId",
    },
    {
      title: "Income",
      dataIndex: "income",
      render: (val) => `$${val.toFixed(2)}`,
    },
    {
      title: "Expenses",
      dataIndex: "expenses",
      render: (val) => `$${val.toFixed(2)}`,
    },
    {
      title: "Profit",
      dataIndex: "profit",
      render: (_, record) => {
        const profit = record.income - record.expenses;
        const color = profit >= 0 ? "green" : "red";
        return <span style={{ color }}>{`$${profit.toFixed(2)}`}</span>;
      },
    },
  ];

  // Finance entries table (raw)
  const entryColumns = [
    { title: 'Project', dataIndex: ['project','name'], render: (_, r) => r.project?.name || '-' },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Amount', dataIndex: 'amount' },
    { title: 'Note', dataIndex: 'note' },
    { title: 'Actions', render: (_, r) => (
      <Popconfirm title="Delete entry?" onConfirm={() => deleteMut.mutate(r._id)}>
        <Button size="small" danger loading={deleteMut.isPending}>Delete</Button>
      </Popconfirm>
    )}
  ];

  const barData = {
    labels: data?.map(d => d.projectId) || [],
    datasets: [
      { label: 'Income', data: data?.map(d => d.income) || [], backgroundColor: 'rgba(34,197,94,0.6)' },
      { label: 'Expenses', data: data?.map(d => d.expenses) || [], backgroundColor: 'rgba(239,68,68,0.6)' }
    ]
  };

  const onSubmit = () => {
    form.validateFields().then(values => {
      createMut.mutate(values);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Financial Analytics</h2>
        <Button loading={isFetching} onClick={() => refetch()}>
          Refresh Finance
        </Button>
      </div>

      {/* Summary statistics */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Income" value={totalIncome} precision={2} prefix="$" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total Expenses" value={totalExpenses} precision={2} prefix="$" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Profit"
              value={totalProfit}
              precision={2}
              prefix="$"
              valueStyle={{ color: totalProfit >= 0 ? "green" : "red" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      <Card title="Income vs Expenses by Project">
        <Bar data={barData} />
      </Card>

      {/* Table for profit by project */}
      <Card title="Profit By Project (Summary)">
        <Table
          loading={isLoading}
          dataSource={data}
          columns={columns}
          rowKey="projectId"
          pagination={false}
        />
      </Card>

      {/* Raw entries and create */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Finance Entries</h3>
        <Button type="primary" onClick={() => { form.resetFields(); setOpen(true); }}>Add Entry</Button>
      </div>
      <Card>
        <Table loading={isLoading} dataSource={raw?.entries} columns={entryColumns} rowKey="_id" />
      </Card>

      <Modal open={open} title="Add Finance Entry" onCancel={() => setOpen(false)} onOk={onSubmit} confirmLoading={createMut.isPending}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Project" name="project" rules={[{ required: true, message: 'Project required' }]}>
            <Select options={projects?.map(p => ({ label: p.name, value: p._id }))} />
          </Form.Item>
          <Form.Item label="Type" name="type" initialValue="expense">
            <Select options={[{ value: 'expense' }, { value: 'payment' }]} />
          </Form.Item>
          <Form.Item label="Amount" name="amount" rules={[{ required: true, message: 'Amount required' }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Note" name="note">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
