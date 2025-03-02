import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

export function getProjectRoot() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return path.resolve(__dirname, "../../../..");
}

export function resolveProjectPath(...paths: string[]) {
  return path.resolve(getProjectRoot(), ...paths);
}
