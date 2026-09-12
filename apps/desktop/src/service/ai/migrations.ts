import type { PluginStorageHandle } from '@true-north/plugin-sdk/main';

export const aiMigrations = [
  {
    id: 'ai.v1.workspace-refs',
    version: 1,
    async up(storage: PluginStorageHandle) {
      const tables = (await storage.query(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('ai_conversation', 'ai_message')",
      )) as Array<{ name: string }>;
      const tableNames = new Set((tables || []).map((table) => table.name));
      if (!tableNames.has('ai_message')) return;

      const conversationColumns = tableNames.has('ai_conversation')
        ? ((await storage.query(`PRAGMA table_info('ai_conversation')`)) as Array<{ name: string }>)
        : [];
      const conversationColumnNames = new Set(conversationColumns.map((column) => column.name));
      const hasRefColumns = conversationColumnNames.has('ref_type') && conversationColumnNames.has('ref_id');
      const conversations = hasRefColumns
        ? ((await storage.query(
            `SELECT id, ref_type, ref_id FROM ai_conversation WHERE deleted_at IS NULL`,
          )) as Array<{ id: string; ref_type?: string | null; ref_id?: string | null }>)
        : [];
      const refByConversation = new Map<string, { type: 'goal' | 'task'; id: string; label: string }>();

      for (const conversation of conversations) {
        const refType = conversation.ref_type === 'goal' || conversation.ref_type === 'task' ? conversation.ref_type : null;
        const refId = conversation.ref_id?.trim();
        if (!refType || !refId) continue;
        // Legacy importer labels: read leftover SQLite tables if present, never Growth repositories.
        let label = refId;
        try {
          const row = (await storage.query(`SELECT name FROM ${refType} WHERE id = ? LIMIT 1`, [refId])) as Array<{
            name?: string;
          }>;
          if (row?.[0]?.name) label = row[0].name;
        } catch {
          label = refId;
        }
        refByConversation.set(conversation.id, { type: refType, id: refId, label });
      }

      const messages = (await storage.query(
        `SELECT id, conversation_id, parts FROM ai_message WHERE deleted_at IS NULL`,
      )) as Array<{ id: string; conversation_id: string; parts: string }>;

      for (const message of messages) {
        if (!message.parts) continue;
        let parts: unknown;
        try {
          parts = typeof message.parts === 'string' ? JSON.parse(message.parts) : message.parts;
        } catch {
          continue;
        }
        if (!Array.isArray(parts)) continue;
        const conversationRef = refByConversation.get(message.conversation_id);
        let changed = false;
        const nextParts = parts.map((raw) => {
          if (!raw || typeof raw !== 'object') return raw;
          const part = raw as Record<string, unknown>;
          if (part.type === 'text' && part.entityLink && !part.entityLinks) {
            changed = true;
            const { entityLink, ...rest } = part;
            return { ...rest, entityLinks: [entityLink] };
          }
          if (part.type === 'workspace' && conversationRef) {
            const payload =
              part.payload && typeof part.payload === 'object' ? { ...(part.payload as Record<string, unknown>) } : {};
            if (!payload.ref) {
              changed = true;
              return { ...part, payload: { ...payload, ref: conversationRef } };
            }
          }
          return part;
        });
        if (!changed) continue;
        await storage.query(`UPDATE ai_message SET parts = ? WHERE id = ?`, [JSON.stringify(nextParts), message.id]);
      }
    },
  },
];
