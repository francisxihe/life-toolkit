/**
 * Form VO Sync Engine
 */

import { SyncEngine } from '../core/sync-engine';
import { IntermediateState } from '../core/intermediate-state';
import { TargetFormComposer } from './target-composer';
import { Logger } from '../../helpers/Logger';

export class FormSyncEngine extends SyncEngine {
  private composer: TargetFormComposer;
  private logger = Logger.createContextLogger('FormSyncEngine');

  constructor() {
    super();
    this.composer = new TargetFormComposer();
  }

  generateVoContent(intermediateState: IntermediateState): string {
    try {
      return this.composer.composeVo(intermediateState);
    } catch (error) {
      this.logger.error('Failed to generate VO content', error);
      throw error;
    }
  }

  sync(dtoFilePath: string, intermediateState: IntermediateState): boolean {
    const voPath = this.getVoPath(dtoFilePath);
    let content = this.generateVoContent(intermediateState);
    const updateMatch = intermediateState.code?.match(/export class Update(\w+)Dto[\s\S]*/);
    if (updateMatch && intermediateState.metadata.className.startsWith('Create')) {
      const fields = [...updateMatch[0].matchAll(/PickType\([^]*?\[([^\]]+)\]\s+as const\)/g)]
        .flatMap((match) => [...match[1].matchAll(/['\"]([^'\"]+)['\"]/g)].map((item) => item[1]))
        .filter((field) => ['status', 'doneAt', 'abandonedAt'].includes(field));
      const name = updateMatch[1];
      content += `\n\nexport type Update${name}Vo = Partial<Create${name}Vo> & {\n${fields
        .map((field) => `  ${field}?: ${name}Vo['${field}'];`)
        .join('\n')}\n};`;
    }

    let finalContent = content;
    const fs = require('fs');
    if (fs.existsSync(voPath)) {
      const existingContent = fs.readFileSync(voPath, 'utf-8');
      finalContent = this.preserveUserImports(existingContent, content);
    }

    const changed = this.syncToFile(voPath, finalContent);

    if (changed) {
      this.logger.info(`Synced Form VO: ${voPath}`);
    }

    return changed;
  }
}
