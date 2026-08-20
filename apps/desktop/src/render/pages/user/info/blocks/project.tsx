import React from 'react';
import clsx from 'clsx';
import styles from '../style/blocks.module.less';
import { Card, Avatar, Skeleton } from '@sue/design-web-react';

export interface ProjectProps {
  title?: string;
  enTitle?: string;
  contributors?: {
    name?: string;
    email?: string;
    avatar?: string;
  }[];
  contributorsLength?: number;
  loading?: boolean;
}

function ProjectCard(props: ProjectProps) {
  const { loading, contributors } = props;
  return (
    <Card className={styles['project-wrapper']} size="small">
      {loading ?
      <Skeleton paragraph={{ rows: 1 }} animation /> :

      <h6 className="text-title-1 font-medium">{props.title}</h6>
      }

      {loading ?
      <Skeleton paragraph={{ rows: 1 }} animation style={{ marginTop: '4px' }} /> :

      <span className="text-text-3 truncate" style={{ margin: '0' }}>
          {props.enTitle}
        </span>
      }

      <div className={styles.avatar}>
        {loading ?
        <Skeleton paragraph={{ rows: 1 }} animation /> :

        <>
            <Avatar.Group size={24}>
              {(contributors || []).map((item, index) =>
            <Avatar key={index}>
                  <img src={item.avatar} />
                </Avatar>
            )}
            </Avatar.Group>
            <span className={clsx("text-text-3", styles.more)}>
              等{(props.contributorsLength || 0).toLocaleString()}人
            </span>
          </>
        }
      </div>
    </Card>);

}

export default ProjectCard;