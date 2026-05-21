/**
 * Replace {{variable}} placeholders in admin-edited user prompt templates.
 * Unknown placeholders are left unchanged so typos are visible in preview.
 */
export function renderPromptTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      return variables[key] ?? "";
    }
    return match;
  });
}
