import type { Model, ModelConnection, Field } from "./types";

export interface ParsedField extends Field {
  name: string;
  type: string;
  hasConnections: boolean;
}

export interface ParsedModel extends Model {
  name: string;
  fields: ParsedField[];
  isChild: boolean;
}

export const getInfoFromSchema = (
  schema: string,
): { models: ParsedModel[]; connections: ModelConnection[] } => {
  const lines = schema
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const models: ParsedModel[] = [];
  let currentModel: ParsedModel | null = null;

  for (const line of lines) {
    if (line.startsWith("model ")) {
      // ====================== 【严谨修复】 ======================
      // 匹配：model 后面的所有内容，直到 { 之前，自动去掉空格和 {
      const modelMatch = line.match(/model\s+([a-zA-Z0-9_]+)\s*\{/);
      const modelName = modelMatch ? modelMatch[1] : line.split(" ")[1];

      currentModel = {
        name: modelName,
        fields: [],
        isChild: false,
      };
      models.push(currentModel);
    } else if (line.includes(":") && currentModel) {
      const [fieldName, typePart] = line.split(":").map((item) => item.trim());
      const type = typePart.replace(/;$/, "").trim();

      currentModel.fields.push({
        name: fieldName,
        type,
        hasConnections: false,
      });
    }
  }

  const modelNames = models.map((m) => m.name);

  models.forEach((model) => {
    model.fields.forEach((field) => {
      field.hasConnections = modelNames.some((name) =>
        field.type.includes(name),
      );
    });
  });

  const connections: ModelConnection[] = [];
  models.forEach((model) => {
    model.fields.forEach((field) => {
      const targetModel = modelNames.find((modelName) =>
        field.type.includes(modelName),
      );
      if (targetModel) {
        connections.push({
          source: model.name,
          target: targetModel,
          name: field.name,
        });
      }
    });
  });

  models.forEach((model) => {
    model.isChild = connections.some((conn) => conn.target === model.name);
  });

  return { models, connections };
};
