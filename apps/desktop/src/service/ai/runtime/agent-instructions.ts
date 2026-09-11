const sections: string[] = [];

export function addAgentInstructions(text: string) {
  sections.push(text);
}

export function getAgentInstructions(): string {
  return sections.join('\n\n');
}
