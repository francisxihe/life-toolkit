import React, { useState, useEffect } from 'react';
import { DatabaseAPI } from '../api/database';
import { CreateUserData, CreateGoalData, GoalType } from '../types/database';

const DatabaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('未测试');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabase = async () => {
    setLoading(true);
    setLogs([]);
    setStatus('测试中...');

    try {
      // 测试用户创建
      addLog('开始测试用户功能...');
      const userData: CreateUserData = {
        username: 'testuser',
        password: 'testpassword',
        name: '测试用户'
      };
      
      const user = await DatabaseAPI.createUser(userData);
      addLog(`用户创建成功: ${user.username}`);

      // 测试目标创建
      addLog('开始测试目标功能...');
      const goalData: CreateGoalData = {
        name: '测试目标',
        description: '这是一个测试目标',
        type: GoalType.OBJECTIVE,
        importance: 5,
        tags: ['测试', '目标']
      };
      
      const goal = await DatabaseAPI.createGoal(goalData);
      addLog(`目标创建成功: ${goal.name}`);

      // 测试查询功能
      addLog('开始测试查询功能...');
      const goals = await DatabaseAPI.findAllGoals();
      addLog(`查询到 ${goals.length} 个目标`);

      const foundUser = await DatabaseAPI.findUserById(user.id);
      if (foundUser) {
        addLog(`查询用户成功: ${foundUser.username}`);
      }

      setStatus('测试完成 ✅');
      addLog('所有测试通过!');
    } catch (error) {
      console.error('数据库测试失败:', error);
      addLog(`测试失败: ${error instanceof Error ? error.message : String(error)}`);
      setStatus('测试失败 ❌');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setStatus('未测试');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>数据库功能测试</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testDatabase} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? '测试中...' : '开始测试'}
        </button>
        
        <button 
          onClick={clearLogs}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          清空日志
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>状态: </strong>
        <span style={{ 
          color: status.includes('✅') ? 'green' : status.includes('❌') ? 'red' : 'orange' 
        }}>
          {status}
        </span>
      </div>

      <div>
        <h3>测试日志:</h3>
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '10px',
          height: '300px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#6c757d' }}>暂无日志...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseTest;