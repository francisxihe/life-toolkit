// Centralized exports for parser modules (AST + legacy)

// Legacy regex-based utilities and types
export {
  parseApiMethodNames,
  getApiClassBodyRange,
  getMethodOccurrences,
  getClassBodyRange,
  parseDesktopMethodNames,
  collectAllMethodNames,
  parseServerMethodNames,
  typeToServiceConstName,
} from './parser';

// AST parser class/singleton
export { TypeScriptASTParser, astParser } from './core/ast';

// AST-adapted helpers (with fallback in their implementations)
export {
  parseClassName,
  parseConstructorServiceTypes,
  parseMethodDecorators,
  parseServerMethodNames as parseServerMethodNamesAST,
  getClassBodyRange as getClassBodyRangeAST,
  parseControllerInfo,
  getServerMethodDecorators,
} from './parser-ast';
