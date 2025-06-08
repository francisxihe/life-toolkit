# Habit功能使用示例

## 场景1：创建支撑目标的习惯

### 背景
用户设定了一个目标"早晨高效工作"，需要通过养成一些习惯来支撑这个目标的实现。

### 步骤

#### 1. 首先创建目标
```http
POST /goal/create
Content-Type: application/json

{
  "name": "早晨高效工作",
  "description": "每天早上7-9点保持高效的工作状态",
  "type": "PERSONAL",
  "importance": 5,
  "urgency": 4,
  "startAt": "2024-01-01T00:00:00Z",
  "endAt": "2024-12-31T23:59:59Z"
}
```

#### 2. 创建支撑习惯1：早起拉伸
```http
POST /habit/create
Content-Type: application/json

{
  "name": "早起拉伸",
  "description": "每天早上6点起床后进行10分钟拉伸运动",
  "frequency": "daily",
  "difficulty": "medium",
  "importance": 4,
  "goalIds": ["goal-id-from-step1"],
  "autoCreateTodo": true,
  "needReminder": true,
  "reminderTime": "06:00",
  "tags": ["健康", "早起", "运动"]
}
```

#### 3. 创建支撑习惯2：洗冷水澡
```http
POST /habit/create
Content-Type: application/json

{
  "name": "洗冷水澡",
  "description": "拉伸后洗2分钟冷水澡，提升精神状态",
  "frequency": "daily",
  "difficulty": "hard",
  "importance": 3,
  "goalIds": ["goal-id-from-step1"],
  "autoCreateTodo": true,
  "needReminder": false,
  "tags": ["健康", "精神", "挑战"]
}
```

### 结果
- 系统自动为每个习惯创建了重复待办任务配置
- 每天会自动生成对应的待办任务
- 习惯与目标建立了关联关系

## 场景2：完成习惯并自动生成下一个待办

### 背景
用户今天完成了"早起拉伸"的习惯，系统需要自动创建明天的待办任务。

### 步骤

#### 1. 记录习惯完成日志
```http
POST /habit-log/create
Content-Type: application/json

{
  "habitId": "habit-id-early-stretch",
  "logDate": "2024-01-15",
  "completionScore": 100,
  "mood": "good",
  "note": "今天状态很好，拉伸了12分钟"
}
```

### 系统自动处理
1. 更新习惯的连续天数统计
2. 根据习惯的重复配置，自动创建明天的待办任务
3. 待办任务包含习惯的基本信息和标签

### 生成的待办任务示例
```json
{
  "name": "早起拉伸",
  "description": "习惯：每天早上6点起床后进行10分钟拉伸运动",
  "tags": ["健康", "早起", "运动"],
  "importance": 4,
  "urgency": 3,
  "planDate": "2024-01-16",
  "status": "TODO",
  "source": "REPEAT"
}
```

## 场景3：查看目标关联的所有习惯

### 背景
用户想查看"早晨高效工作"这个目标关联了哪些习惯。

### 步骤

#### 1. 根据目标ID获取关联习惯
```http
GET /habit/by-goal/goal-id-morning-efficiency
```

### 响应示例
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "habit-1",
        "name": "早起拉伸",
        "description": "每天早上6点起床后进行10分钟拉伸运动",
        "frequency": "daily",
        "currentStreak": 15,
        "longestStreak": 20,
        "completedCount": 45
      },
      {
        "id": "habit-2", 
        "name": "洗冷水澡",
        "description": "拉伸后洗2分钟冷水澡，提升精神状态",
        "frequency": "daily",
        "currentStreak": 12,
        "longestStreak": 18,
        "completedCount": 38
      }
    ]
  }
}
```

## 场景4：获取习惯的完整关联信息

### 背景
用户想查看某个习惯的详细信息，包括关联的目标和待办任务。

### 步骤

#### 1. 获取习惯详情（包含关联）
```http
GET /habit/detail-with-relations/habit-id-early-stretch
```

### 响应示例
```json
{
  "code": 200,
  "data": {
    "id": "habit-1",
    "name": "早起拉伸",
    "description": "每天早上6点起床后进行10分钟拉伸运动",
    "frequency": "daily",
    "difficulty": "medium",
    "currentStreak": 15,
    "longestStreak": 20,
    "completedCount": 45,
    "goals": [
      {
        "id": "goal-1",
        "name": "早晨高效工作",
        "status": "TODO",
        "importance": 5
      }
    ],
    "todoRepeats": [
      {
        "id": "repeat-1",
        "repeatMode": "daily",
        "repeatConfig": { "interval": 1 },
        "repeatEndMode": "FOREVER"
      }
    ]
  }
}
```

## 场景5：禁用自动创建待办任务

### 背景
用户有一个习惯不希望自动创建待办任务，只想手动记录。

### 步骤

#### 1. 创建不自动生成待办的习惯
```http
POST /habit/create
Content-Type: application/json

{
  "name": "睡前阅读",
  "description": "每天睡前阅读30分钟",
  "frequency": "daily",
  "difficulty": "easy",
  "importance": 3,
  "autoCreateTodo": false,
  "needReminder": true,
  "reminderTime": "21:30"
}
```

### 结果
- 习惯创建成功，但不会自动创建重复待办任务
- 用户需要手动创建待办任务或直接记录习惯日志

## 场景6：更新习惯的目标关联

### 背景
用户想要调整习惯关联的目标。

### 步骤

#### 1. 更新习惯关联
```http
PUT /habit/update/habit-id-early-stretch
Content-Type: application/json

{
  "goalIds": ["goal-1", "goal-2", "goal-3"]
}
```

### 结果
- 习惯的目标关联被更新
- 原有的关联关系被替换为新的关联关系

## 最佳实践

### 1. 习惯设计
- 从简单的习惯开始，逐步增加难度
- 设置合理的提醒时间
- 为习惯添加有意义的标签

### 2. 目标关联
- 一个目标可以关联多个相关习惯
- 习惯也可以支撑多个目标
- 定期回顾目标和习惯的关联关系

### 3. 待办任务管理
- 对于重要习惯启用自动创建待办任务
- 对于灵活性要求高的习惯可以禁用自动创建
- 定期清理已完成的待办任务

### 4. 数据分析
- 利用连续天数统计来激励自己
- 通过完成率分析习惯的执行情况
- 结合目标进度来调整习惯策略 