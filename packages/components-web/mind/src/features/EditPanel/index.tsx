import { css } from '@emotion/css';
import { 
  useMindmapActions, 
  useNodeActions, 
  useEditPanelActions 
} from '../../context';
import MdEditor from '../../components/mdEditor';

const EditPanel = () => {
  // 使用新的 hooks API
  const { editPanel } = useEditPanelActions();
  const { nodeStatus } = useNodeActions();
  const { changeText } = useMindmapActions();

  // 从 nodeStatus 中获取当前节点信息
  const { cur_node_info = {} } = nodeStatus;
  const { info, text, id } = cur_node_info;
  
  const infoText = typeof info === 'string' ? info : (info?.description || '');

  if (!editPanel.isShow) {
    return null;
  }

  const { hidePanel } = useEditPanelActions();

  return (
    <div className={show} onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
      当前编辑节点：{text || '无'}
      <i
        className="zwicon-close"
        style={close}
        onClick={() => hidePanel()}
      ></i>
      <MdEditor
        className={mdEditor}
        propText={infoText}
        onBlur={value => id && changeText(id, { info: { description: value } })}
      />
      {/* <Button type="primary" onClick={()=>mindmapHook.editNodeInfo(id,inputVal)}>保存</Button>
            <Button type="primary" onClick={()=>editPanelHook.togglePanelShow(false)}>关闭</Button> */}
    </div>
  );
};

export default EditPanel;

// CSS
const show = css`
  height: 500px;
  width: 300px;
  top: 20px;
  right: 40px;
  margin: 56px 0 0;
  overflow: auto;
  position: fixed;
  //z-index: 10;
  border: 2px solid #eeee;
  border-radius: 10px;
  background: #fff;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.16);
  padding: 20px 10px;
`;

const close = {
  fontSize: 20,
  position: 'absolute' as const,
  cursor: 'pointer',
  right: '10px',
  top: '5px',
};

const mdEditor = css`
  margin-top: 20px;
  width: 295px;
  height: 460px;
`;
