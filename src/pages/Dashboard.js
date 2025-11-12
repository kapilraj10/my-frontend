import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOverview, fetchProjects, fetchFinancials, fetchTasks } from '../services/api';
import { Card, Row, Col, Statistic, Collapse, Progress, Tag } from 'antd';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function Dashboard() {
  const { data: overview } = useQuery({ queryKey: ['overview'], queryFn: fetchOverview });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const { data: finance } = useQuery({ queryKey: ['finance'], queryFn: fetchFinancials });
  const { data: tasks } = useQuery({ queryKey: ['tasks'], queryFn: fetchTasks });

  const completionBar = {
    labels: projects?.map(p => p.name) || [],
    datasets: [
      {
        label: 'Completion %',
        data: projects?.map(p => parseFloat(p.completionPercent?.toFixed(1))) || [],
        backgroundColor: 'rgba(99,102,241,0.6)'
      }
    ]
  };

  // Task status distribution
  const taskCounts = ['todo','in-progress','review','done'].map(s => tasks?.filter(t => t.status === s).length || 0);
  const taskBar = {
    labels: ['Todo','In-Progress','Review','Done'],
    datasets: [
      { label: 'Tasks', data: taskCounts, backgroundColor: 'rgba(34,197,94,0.6)' }
    ]
  };

  return (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col xs={12} md={6}><Card><Statistic title="Projects" value={overview?.projectCount || 0} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Clients" value={overview?.clientCount || 0} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Team Members" value={overview?.teamCount || 0} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Open Bugs" value={overview?.bugOpen || 0} /></Card></Col>
      </Row>

      <Collapse accordion items={[
        {
          key: 'projects',
            label: 'Project Progress',
            children: (
              <div className="space-y-4">
                <Card size="small" title="Completion Chart">
                  <Bar data={completionBar} />
                </Card>
                <div className="grid md:grid-cols-3 gap-4">
                  {projects?.map(p => (
                    <Card key={p._id} size="small" title={p.name}>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs"><span>Status:</span><Tag>{p.status}</Tag></div>
                        <Progress percent={parseFloat(p.completionPercent?.toFixed(1))} size="small" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
        },
        {
          key: 'finance',
          label: 'Finance Summary',
          children: (
            <div className="space-y-4">
              <Card size="small" title="Profit By Project">
                <div className="grid md:grid-cols-3 gap-4">
                  {finance?.map(f => (
                    <Card key={f.projectId} size="small">
                      <div className="text-sm font-medium mb-1">{f.projectId}</div>
                      <div className="text-xs">Income: ${f.income.toFixed(2)}</div>
                      <div className="text-xs">Expenses: ${f.expenses.toFixed(2)}</div>
                      <div className="text-xs">Profit: <span style={{ color: f.profit >= 0 ? 'green' : 'red' }}>${f.profit.toFixed(2)}</span></div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )
        },
        {
          key: 'tasks',
          label: 'Tasks Overview',
          children: (
            <div className="space-y-4">
              <Card size="small" title="Task Status Distribution">
                <Bar data={taskBar} />
              </Card>
              <div className="grid md:grid-cols-4 gap-4">
                {['todo','in-progress','review','done'].map(status => (
                  <Card key={status} size="small" title={status.replace('-', ' ')}>
                    {tasks?.filter(t => t.status === status).map(t => (
                      <div key={t._id} className="flex justify-between text-xs py-1 border-b last:border-none">
                        <span className="truncate" style={{ maxWidth: '70%' }}>{t.title}</span>
                        <span>{parseFloat(t.progress?.toFixed(0))}%</span>
                      </div>
                    )) || '—'}
                  </Card>
                ))}
              </div>
            </div>
          )
        }
      ]} />
    </div>
  );
}
