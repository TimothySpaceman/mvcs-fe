export const SchemaFieldTypes = {
    text: "text",
    number: "number",
    boolean: "boolean",
    select: "select",
    password: "password",
} as const;
export type SchemaFieldType = keyof typeof SchemaFieldTypes;

export type BaseSchemaField = {
    type: SchemaFieldType
    key: string
    label: string
    description?: string | null
    required?: boolean | null
}

export type TextSchemaField = BaseSchemaField & {
    type: "text"
    minLength?: number | null
    maxLength?: number | null
    placeholder?: string | null
    pattern?: string | null
}

export type NumberSchemaField = BaseSchemaField & {
    type: "number"
    min?: number | null
    max?: number | null
    step?: number | null
    placeholder?: string | null
}

export type BooleanSchemaField = BaseSchemaField & {
    type: "boolean"
    defaultValue?: boolean | null
}

export type SelectSchemaFieldOption = {
    value: string
    label: string
}

export type SelectSchemaField = BaseSchemaField & {
    type: "select"
    placeholder?: string | null
    options: SelectSchemaFieldOption[]
}

export type PasswordSchemaField = BaseSchemaField & {
    type: "password"
    minLength?: number | null
    maxLength?: number | null
    placeholder?: string | null
}

export type SchemaField =
    TextSchemaField
    | NumberSchemaField
    | BooleanSchemaField
    | SelectSchemaField
    | PasswordSchemaField

export type StorageConfigSchema = {
    fields: SchemaField[]
}

export type StorageTypeInfo = {
    id: string
    key: string
    label: string
    description: string
}

export type StorageType = StorageTypeInfo & {
    configSchema: StorageConfigSchema
}

export type Storage = {
    id: string
    name: string
    storageType: StorageTypeInfo
    isDefault: boolean
    isPublic: boolean
    createdAt: string
    updatedAt: string
}

export type StorageHealth = {
    isReachable: boolean
    error: string | null
}