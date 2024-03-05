import mime from "mime";

// 提供了针对form表单的增强型操作

interface Boundary {
  position: number; // 在字符串中的位置
  line: number; // 行号
  content: string; // 内容, 例如: ----WebKitFormBoundaryePkpFF7tjBAqx29L
}

/**
 * 用于解析boundary,记录一个boundary的起始和结束位置
 */
interface BoundaryPair {
  start: Boundary;
  end: Boundary;
}

/**
 * 从原始的form表单中解析出boundary,这是一个迭代器,每次调用next方法都会返回一个boundaryPair,
 * 只有在调用next方法后才会解析下一个boundaryPair,避免一次性解析所有的boundaryPair,造成内存浪费
 */
class BoundaryParser {
  private formLines: string[]; // 表单的每一行
  private current: BoundaryPair | null;
  static create(formLines: string[]) {
    return new BoundaryParser(formLines);
  }
  constructor(formLines: string[]) {
    this.formLines = formLines;
    this.current = null;
    this.doNext();
  }
  hasNext() {
    return this.current !== null;
  }
  next(): BoundaryPair | null {
    const current = this.current;
    this.doNext();
    return current;
  }
  private doNext() {
    // 继续往下查找下一个boundaryPair
    const first = this.current === null;
    const start = first ? 0 : this.current!.end.position;
    const end = this.formLines.length;
    const currentStart = first
      ? this.findFirstBoundaryIndex(start - 1, end)
      : this.current!.end.position;
    const currentEnd = this.findFirstBoundaryIndex(
      currentStart,
      end,
      this.formLines[currentStart],
    );
    if (currentStart === -1 || currentEnd === -1) {
      this.current = null;
      return null;
    }
    const startBoundary = {
      position: currentStart,
      line: currentStart,
      content: this.formLines[currentStart],
    } as Boundary;
    const endBoundary = {
      position: currentEnd,
      line: currentEnd,
      content: this.formLines[currentEnd],
    } as Boundary;

    this.current = {
      start: startBoundary,
      end: endBoundary,
    } as BoundaryPair;
  }

  private findFirstBoundaryIndex(
    startNotInclude: number,
    endNotInclude: number,
    boundary?: string,
  ): number {
    const boundaryRegex = new RegExp(`^----(.*)$`);
    // 查找起始点
    for (let i = startNotInclude + 1; i < endNotInclude; i++) {
      const line = this.formLines[i];
      if (boundaryRegex.test(line)) {
        console.log("boundary", boundary);
        if (boundary !== "" && boundary !== undefined) {
          if (line.startsWith(boundary)) {
            return i;
          }
        } else {
          return i;
        }
      }
    }
    return -1;
  }
}

/**
 * 用于解析form表单中的每一个boundaryPair,并将其转换为FormDataMetadata
 * FormDataMetadata是一个树形结构,每一个节点都是一个FormDataMetadata,由此实现了对嵌套表单的支持
 */
export interface FormDataMetadata {
  header?: Record<string, string>;
  body?: string | Blob;
  file?: File;
  fileName?: string;
  contentType?: string;
  name?: string;
  children?: FormDataMetadata[];
  boundaryPair?: BoundaryPair;
}

/**
 * 用于解析form表单,并将其转换为FormDataMetadata
 */
export class FormDataParser {
  private formLines: string[]; // 表单的每一行
  private boundaryParser: BoundaryParser;
  static of(formLines: string[]) {
    return new FormDataParser(formLines);
  }
  static ofString(formString: string) {
    return new FormDataParser(formString.split("\n"));
  }
  constructor(formLines: string[]) {
    this.formLines = formLines;
    this.boundaryParser = BoundaryParser.create(formLines);
  }
  public isFormData() {
    return this.boundaryParser.hasNext();
  }
  public parse(): FormDataMetadata[] {
    const result: FormDataMetadata[] = [];
    const boundaryParser = BoundaryParser.create(this.formLines);
    let next = null;
    while ((next = boundaryParser.next()) !== null) {
      // 处理每一个boundaryPair
      const metadata = this.parseBoundaryPair(next);
      result.push(metadata);
    }
    return result;
  }
  private parseBoundaryPair(boundaryPair: BoundaryPair): FormDataMetadata {
    const start = boundaryPair.start.position;
    const end = boundaryPair.end.position;
    const contents = this.formLines.slice(start + 1, end);
    // 根据规范,boundary后面的第一行是header然后是空行,然后是body
    // 所以,此处我们先获取第一个空行的位置,然后再获取header和body
    const emptyLineIndex = contents.indexOf("");
    const header = contents.slice(0, emptyLineIndex);
    // 解析header
    const headerMap = header.reduce(
      (prev, curr) => {
        const [key, value] = curr.split(":");
        prev[key] = value;
        return prev;
      },
      {} as Record<string, string>,
    );
    const metadata = {} as FormDataMetadata;
    metadata.boundaryPair = boundaryPair;
    metadata.header = headerMap;
    metadata.contentType = (headerMap["Content-Type"] || "text/plain").trim();
    // 尝试从Content-Disposition中获取name和filename
    const contentDisposition = headerMap["Content-Disposition"];
    if (contentDisposition) {
      // 通常情况下,Content-Disposition的格式为: form-data; name="fieldName"; filename="filename.jpg"
      const contentDispositionMap = contentDisposition.split(";").reduce(
        (prev, curr) => {
          const [key, value] = curr.trim().split("=");
          let v = value?.trim();
          if (v) {
            // 去掉双引号
            if (v.startsWith('"') && v.endsWith('"')) {
              v = v.slice(1, v.length - 1).trim();
            }
          }

          prev[key?.trim()] = v;
          return prev;
        },
        {} as Record<string, string>,
      );
      metadata.name = contentDispositionMap["name"];
      metadata.fileName = contentDispositionMap["filename"];
    }

    // 此时需要考虑到body中可能包含boundary,所以需要先判断body中是否包含boundary
    const bodyContent = contents.slice(emptyLineIndex + 1);
    const bodaParser = FormDataParser.of(bodyContent);
    metadata.body = bodyContent.join("\n");
    if (bodaParser.isFormData()) {
      metadata.children = bodaParser.parse();
    } else {
      if (metadata.fileName) {
        // 说明是文件
        metadata.file = new File(
          [new Blob(bodyContent, { type: metadata.contentType })],
          metadata.fileName,
        );
      }
    }
    return metadata;
  }
}

/**
 * 用于创建FormData,但是十分遗憾的是,FormData原生并不支持嵌套的数据结构,所以我们需要自己实现,下面有一个CustomFormData的实现
 */
export class FormDataCreate {
  private formMetadata: FormDataMetadata[];
  static parse(formStr: string) {
    const formMetadata = ParseMultipartFormData(formStr);
    return new FormDataCreate(formMetadata);
  }
  static of(formMetadata: FormDataMetadata[]) {
    return new FormDataCreate(formMetadata);
  }
  static wrapper(formMetadata: FormDataMetadata) {
    return new FormDataCreate([formMetadata]);
  }
  constructor(formMetadata: FormDataMetadata[]) {
    this.formMetadata = formMetadata;
  }
  public create() {
    const formData = new FormData();
    this.formMetadata.forEach((metadata) => {
      this.processMetadata(formData, metadata);
    });
    return formData;
  }
  private processMetadata(formData: FormData, metadata: FormDataMetadata) {
    const { name, body, file } = metadata;
    if (file) {
      formData.append(name!, file, metadata.fileName);
    } else {
      formData.append(name!, body!);
    }
  }
}

export class CommonFormDataCreate {
  private formMetadata: FormDataMetadata[];
  static parse(formStr: string) {
    const formMetadata = ParseMultipartFormData(formStr);
    return new CommonFormDataCreate(formMetadata);
  }
  static of(formMetadata: FormDataMetadata[]) {
    return new CommonFormDataCreate(formMetadata);
  }
  static wrapper(formMetadata: FormDataMetadata) {
    return new CommonFormDataCreate([formMetadata]);
  }
  constructor(formMetadata: FormDataMetadata[]) {
    this.formMetadata = formMetadata;
  }
  public create() {
    const formData = new ComplexFormData();
    this.formMetadata.forEach((metadata) => {
      this.processMetadata(formData, metadata);
    });
    return formData;
  }
  private processMetadata(
    formData: ComplexFormData,
    metadata: FormDataMetadata,
  ) {
    const { name, body, file, children } = metadata;
    if (children) {
      formData.append(name!, CommonFormDataCreate.of(children).create());
    } else if (file) {
      formData.append(name!, file);
    } else {
      formData.append(name!, body!);
    }
  }
}

export function ParseMultipartFormData(formData: string): FormDataMetadata[] {
  return FormDataParser.of(formData.split("\n")).parse();
}

interface RequestDetails {
  headers: {
    "Content-Type": string;
    [key: string]: string; // 允许其他自定义头部
  };
  body: string; // 直接返回字符串形式的请求体文本
  boundary: string;
}

interface Field {
  name: string;
  value: ComplexFormData | File | Blob | string;
  contentType?: string;
  contentDisposition?: string;
}

export class ComplexFormData {
  private boundary: string;
  private fields: Field[];

  public static create() {
    return new ComplexFormData();
  }

  constructor() {
    this.boundary = this.randomBoundary();
    this.fields = [];
  }

  append(name: string, value: ComplexFormData | File | Blob | string) {
    const contentType = this.getContentType(value);
    this.fields.push({
      name,
      value,
      contentType,
    });

    return this;
  }

  async toText(includeFormDataInfo: boolean = true): Promise<string> {
    if (this.fields.length === 0) {
      return "";
    }

    let body = "";
    for (const field of this.fields) {
      if (field.value instanceof ComplexFormData) {
        if (includeFormDataInfo) {
          body += `\r\n--${this.boundary}\r\n`;
          body += this.createContentDisposition(field);
          body += `Content-Type: ${
            field.contentType || "multipart/form-data"
          }\r\n\r\n`;
        }
        body += await (field.value as ComplexFormData).toText();
      } else {
        body += `\r\n--${this.boundary}\r\n`;
        body += await this.getBody(field);
      }
    }
    body += `\r\n--${this.boundary}--`;

    return body;
  }

  private getContentType(value: ComplexFormData | File | Blob | string) {
    if (value instanceof File) {
      return mime.getType(value.name) || "application/octet-stream";
    }

    if (value instanceof ComplexFormData) {
      return "multipart/form-data";
    }

    if (value instanceof Blob) {
      return value.type || "application/octet-stream";
    }

    return "text/plain";
  }

  private createContentDisposition(field: Field): string {
    const { name, contentDisposition, value } = field;

    if (contentDisposition) {
      return `Content-Disposition: ${contentDisposition}`;
    }

    let disposition = `Content-Disposition: form-data; name="${name}"`;
    if (value instanceof File || value instanceof Blob) {
      disposition += `; filename="${value.name}"`;
    }
    return disposition + `\r\n`;
  }

  private async getBody(field: Field): Promise<string> {
    let body = `${this.createContentDisposition(field)}`;

    if (field.value instanceof File || field.value instanceof Blob) {
      body += `Content-Type: ${
        field.contentType || "application/octet-stream"
      }\r\n\r\n`;
      try {
        const text = await this.readFileAsync(field.value);
        body += text;
      } catch (error) {
        console.error("Error reading file:", error);
      }
    } else {
      body += `Content-Type: ${field.contentType || "text/plain"}\r\n\r\n`;
      body += field.value;
    }

    return body;
  }

  private async readFileAsync(file: File | Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        resolve(text);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file);
    });
  }

  private randomBoundary() {
    return `----CATMAN-CC-${Math.random().toString(16).slice(2)}`;
  }

  async getRequestDetails(
    includeFormDataInfo: boolean = true,
  ): Promise<RequestDetails> {
    const headers: {
      "Content-Type": string;
      [key: string]: string;
    } = {
      "Content-Type": `multipart/form-data; boundary=${this.boundary}`,
    };

    const body = await this.toText(includeFormDataInfo);

    return {
      headers,
      body,
      boundary: this.boundary,
    };
  }
}
