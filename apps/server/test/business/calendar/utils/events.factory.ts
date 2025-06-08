import { Event } from '../../../../src/business/calendar/event.entity';

/**
 * 日历事件测试数据工厂
 */
export class EventsTestFactory {
  /**
   * 创建基础事件
   */
  static createBasicEvent(overrides?: Partial<Event>): Event {
    const event = new Event();
    event.id = 'event-1';
    event.title = '测试会议';
    event.date = '2024-01-01';
    event.startTime = '09:00';
    event.endTime = '10:00';
    event.color = '#3498db';
    event.description = '这是一个测试会议';
    
    return Object.assign(event, overrides);
  }

  /**
   * 创建工作事件
   */
  static createWorkEvent(overrides?: Partial<Event>): Event {
    return this.createBasicEvent({
      title: '工作会议',
      startTime: '14:00',
      endTime: '15:30',
      color: '#e74c3c',
      description: '重要的工作会议',
      ...overrides,
    });
  }

  /**
   * 创建个人事件
   */
  static createPersonalEvent(overrides?: Partial<Event>): Event {
    return this.createBasicEvent({
      title: '个人约会',
      startTime: '18:00',
      endTime: '20:00',
      color: '#2ecc71',
      description: '个人时间安排',
      ...overrides,
    });
  }

  /**
   * 创建全天事件
   */
  static createAllDayEvent(overrides?: Partial<Event>): Event {
    return this.createBasicEvent({
      title: '全天活动',
      startTime: '00:00',
      endTime: '23:59',
      color: '#f39c12',
      description: '全天的活动安排',
      ...overrides,
    });
  }

  /**
   * 创建多个事件
   */
  static createMultipleEvents(count: number): Event[] {
    return Array.from({ length: count }, (_, index) =>
      this.createBasicEvent({
        id: `event-${index + 1}`,
        title: `事件${index + 1}`,
        startTime: `${9 + index}:00`,
        endTime: `${10 + index}:00`,
      })
    );
  }

  /**
   * 创建一天的事件列表
   */
  static createDayEvents(): Event[] {
    return [
      this.createBasicEvent({
        id: 'event-morning',
        title: '晨会',
        startTime: '09:00',
        endTime: '09:30',
        color: '#3498db',
      }),
      this.createWorkEvent({
        id: 'event-work',
        title: '项目讨论',
        startTime: '14:00',
        endTime: '15:30',
      }),
      this.createPersonalEvent({
        id: 'event-personal',
        title: '健身',
        startTime: '18:00',
        endTime: '19:00',
      }),
    ];
  }

  /**
   * 创建重叠时间的事件
   */
  static createOverlappingEvents(): Event[] {
    return [
      this.createBasicEvent({
        id: 'event-1',
        title: '会议A',
        startTime: '10:00',
        endTime: '11:30',
      }),
      this.createBasicEvent({
        id: 'event-2',
        title: '会议B',
        startTime: '11:00',
        endTime: '12:00',
      }),
    ];
  }

  /**
   * 创建边界值测试数据
   */
  static createBoundaryTestData() {
    return {
      earlyMorning: this.createBasicEvent({
        title: '早晨事件',
        startTime: '00:00',
        endTime: '01:00',
      }),
      lateNight: this.createBasicEvent({
        title: '深夜事件',
        startTime: '23:00',
        endTime: '23:59',
      }),
      longTitle: this.createBasicEvent({
        title: '这是一个非常长的事件标题'.repeat(5),
      }),
      longDescription: this.createBasicEvent({
        description: '这是一个非常长的事件描述'.repeat(20),
      }),
    };
  }

  /**
   * 创建不同颜色的事件
   */
  static createColorfulEvents(): Event[] {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
    return colors.map((color, index) =>
      this.createBasicEvent({
        id: `event-color-${index + 1}`,
        title: `${color}事件`,
        color,
        startTime: `${9 + index}:00`,
        endTime: `${10 + index}:00`,
      })
    );
  }

  /**
   * 创建跨月事件数据
   */
  static createMonthlyEvents(): Event[] {
    const dates = ['2024-01-15', '2024-02-15', '2024-03-15'];
    return dates.map((date, index) =>
      this.createBasicEvent({
        id: `event-monthly-${index + 1}`,
        title: `月度事件${index + 1}`,
        date,
      })
    );
  }

  /**
   * 创建随机事件
   */
  static createRandomEvent(): Event {
    const titles = ['会议', '培训', '约会', '活动', '聚餐'];
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomHour = Math.floor(Math.random() * 14) + 8; // 8-21点

    return this.createBasicEvent({
      title: `随机${randomTitle}`,
      color: randomColor,
      startTime: `${randomHour.toString().padStart(2, '0')}:00`,
      endTime: `${(randomHour + 1).toString().padStart(2, '0')}:00`,
    });
  }

  /**
   * 创建ICS测试数据
   */
  static createICSTestEvents(): Event[] {
    return [
      this.createBasicEvent({
        id: 'ics-event-1',
        title: 'ICS测试事件1',
        date: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        description: 'ICS导出测试事件',
      }),
      this.createBasicEvent({
        id: 'ics-event-2',
        title: 'ICS测试事件2',
        date: '2024-01-02',
        startTime: '14:00',
        endTime: '15:30',
        description: '另一个ICS导出测试事件',
      }),
    ];
  }
} 