import React from 'react';
import { Alert, Card, Tag, DoubleRightOutlined } from '@sue/design-web-react';

import { useSelector } from 'react-redux';
import useLocale from '@/utils/useLocale';
import locale from './locale';
import CodeBlock from './code-block';
export default function Welcome() {
  const t = useLocale(locale);
  const userInfo = useSelector((state: any) => state.userInfo) || {};
  return (
    <div>
      <div className="bg-bg-2 p-5">
        <h5 className="text-title-1 font-medium" style={{ marginTop: 0 }}>
          {t['welcome.title.welcome']}
        </h5>
        <span className="text-text-3">
          {userInfo.name}, {userInfo.email}
        </span>
      </div>
      <div>
        <Alert type="success" content={t['welcome.invite']} />
        <Card style={{ marginTop: 20 }} title={t['welcome.usage']}>
          <h6 className="text-title-1 font-medium" style={{ marginTop: 0 }}>
            1. {t['welcome.step.title.pickup']}
          </h6>
          <span>
            {t['welcome.step.content.pickup']}
            <Tag style={{ marginLeft: 8 }}>
              @arco-design/pro-pages-workplace
            </Tag>
          </span>
          <h6 className="text-title-1 font-medium">
            2. {t['welcome.step.title.install']}
          </h6>
          <span>{t['welcome.step.content.install']}</span>
          <CodeBlock code="arco block use @arco-design/pro-pages-workplace" />
          <h6 className="text-title-1 font-medium" style={{ marginTop: 0 }}>
            3. {t['welcome.step.title.result']}
          </h6>
          <span>{t['welcome.step.content.result']}</span>
        </Card>
        <Card style={{ marginTop: 20 }}>
          <span>{t['welcome.title.material']}</span>
          <div style={{ marginTop: 8 }}>
            <a
              target="_blank"
              href="https://arco.design/material?category=arco-design-pro" style={{ color: "var(--color-primary-6)" }}>

              {t['welcome.link.material-pro']} <DoubleRightOutlined />
            </a>
          </div>
          <div style={{ marginTop: 8 }}>
            <a target="_blank" href="https://arco.design/material" style={{ color: "var(--color-primary-6)" }}>
              {t['welcome.link.material-all']} <DoubleRightOutlined />
            </a>
          </div>
        </Card>
      </div>
    </div>);

}