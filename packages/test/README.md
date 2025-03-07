# @life-toolkit/test

测试工具包，提供端到端测试和集成测试支持。

## 独立请求模式

从版本1.x开始，测试包支持独立请求模式，不再强依赖于服务器应用的`AppModule`。

### 使用说明

1. 确保目标服务器已经启动并可访问
2. 设置环境变量`API_BASE_URL`指向目标服务器（默认为`http://localhost:3000`）
3. 使用`supertest`和`getApiBaseUrl()`函数进行HTTP请求测试

### 示例代码

```typescript
import request from 'supertest';
import { getApiBaseUrl } from '@life-toolkit/test/jest-e2e.setup';

describe('API测试', () => {
  const baseUrl = getApiBaseUrl();
  
  it('应该返回正确的数据', () => {
    return request(baseUrl)
      .get('/some-endpoint')
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(200);
      });
  });
});
```

### 运行测试

```bash
# 运行所有测试
pnpm test:e2e

# 运行特定测试文件
pnpm test:e2e -- path/to/test.spec.ts
```

## 环境变量设置

在`jest-e2e.setup.ts`中可以配置以下环境变量：

- `NODE_ENV`: 测试环境（默认为`test`）
- `API_BASE_URL`: API基础URL（默认为`http://localhost:3000`）
- `DB_HOST`: 数据库主机
- `DB_PORT`: 数据库端口
- `DB_USERNAME`: 数据库用户名
- `DB_PASSWORD`: 数据库密码
- `DB_DATABASE`: 数据库名称（默认为`life_toolkit_test`） 