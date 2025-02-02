import { useState } from 'react';
import { Button } from '@arco-design/web-react';

export default function Media() {
  let mediaRecorder: MediaRecorder;
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  function onClickStartRecord() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        mediaRecorder.ondataavailable = (event) => {
          setAudioChunks((prev) => [...prev, event.data]);
        };
      })
      .catch((err) => {
        console.error('获取麦克风权限失败:', err);
      });
  }

  function onClickStopRecord() {
    mediaRecorder.stop();
  }

  function onClickCancelRecord() {
    mediaRecorder.stop();
  }

  function onClickDownloadAudio() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(audioBlob);

    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'recording.webm';
    a.click(); // 触发下载
  }

  // 清空音频块，准备下一次录音
  function onClickClearAudioChunks() {
    setAudioChunks([]);
  }

  return (
    <div>
      <Button onClick={onClickStartRecord}>开始录音</Button>
      <Button onClick={onClickStopRecord}>停止录音</Button>
      <Button onClick={onClickCancelRecord}>取消录音</Button>
      <Button onClick={onClickDownloadAudio}>
        下载录音 {audioChunks.length}
      </Button>
      <Button onClick={onClickClearAudioChunks}>清空音频块</Button>
    </div>
  );
}
