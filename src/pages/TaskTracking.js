import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, createTask, updateTask, deleteTask } from "../services/api";
import { Card, Progress, Tag, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, message } from "antd";
import clsx from "clsx";

// Order of task statuses
const statusOrder = ["todo", "in-progress", "review", "done"];

export default function TaskTracking() {
  const qc = useQueryClient();
  const { data: tasks, isLoading, refetch, isFetching } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const createMut = useMutation({ mutationFn: createTask, onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); message.success('Task created'); setOpen(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, values }) => updateTask(id, values), onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); message.success('Task updated'); setOpen(false); } });
  const deleteMut = useMutation({ mutationFn: deleteTask, onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); message.success('Task deleted'); } });

  // Group tasks by status
  const grouped = useMemo(() => {
    const map = {};
    statusOrder.forEach((status) => (map[status] = []));
    tasks?.forEach((task) => map[task.status].push(task));
    return map;
  }, [tasks]);

  // Status color mapping
  const colorMap = {
    todo: "default",
    "in-progress": "blue",
    review: "orange",
    done: "green",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Task Tracking</h2>
        <div className="flex gap-2">
          <Button loading={isFetching} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>
            Add Task
          </Button>
        </div>
      </div>

      {/* Task cards by status */}
      <div className="grid md:grid-cols-4 gap-4">
        {statusOrder.map((status) => (
          <Card
            key={status}
            title={
              <div className="flex items-center justify-between">
                <span className="capitalize">{status.replace("-", " ")}</span>
                <Tag color={colorMap[status]}>{grouped[status]?.length || 0}</Tag>
              </div>
            }
            loading={isLoading}
            className={clsx(
              "border rounded",
              status === "done" && "bg-green-50 dark:bg-green-900/20"
            )}
          >
            <div className="space-y-3">
              {grouped[status]?.length ? (
                grouped[status].map((task) => (
                  <Card size="small" key={task._id} className="border dark:border-gray-700">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{task.title}</span>
                        <Space size={4}>
                          <Button size="small" onClick={() => { setEditing(task); form.setFieldsValue({ title: task.title, assignee: task.assignee, status: task.status, progress: task.progress }); setOpen(true); }}>Edit</Button>
                          <Popconfirm title="Delete task?" onConfirm={() => deleteMut.mutate(task._id)}>
                            <Button size="small" danger loading={deleteMut.isPending}>Del</Button>
                          </Popconfirm>
                        </Space>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">Assignee: {task.assignee || '—'}</div>
                      <Progress percent={parseFloat((task.progress || 0).toFixed(1))} size="small" status={task.progress === 100 ? "success" : "active"} />
                    </Space>
                  </Card>
                ))
              ) : (
                <div className="text-xs text-gray-400">No tasks.</div>
              )}
            </div>
          </Card>
        ))}
      </div>
      <Modal open={open} title={editing ? 'Edit Task' : 'Add Task'} onCancel={() => setOpen(false)} onOk={() => {
        form.validateFields().then(values => {
          if (editing) {
            updateMut.mutate({ id: editing._id, values });
          } else {
            createMut.mutate(values);
          }
        });
      }} confirmLoading={createMut.isPending || updateMut.isPending}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Title required' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Assignee" name="assignee">
            <Input />
          </Form.Item>
          <Form.Item label="Status" name="status" initialValue="todo">
            <Select options={statusOrder.map(s => ({ value: s }))} />
          </Form.Item>
          <Form.Item label="Progress %" name="progress" initialValue={0}>
            <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
