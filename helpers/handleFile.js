import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../data.json");

const readJSONFile = async () => {
  const fileData = await readFile(filePath, "utf8");
  const data = JSON.parse(fileData);
  return data;
};

const saveJSONFile = async (data) => {
  try {
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("JSON 파일 저장 에러: ", error);
    return false;
  }
};

export { readJSONFile, saveJSONFile };
