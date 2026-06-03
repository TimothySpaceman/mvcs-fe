import {SchemaField, SchemaFieldTypes} from "@/lib/entities/storage";
import TextFieldEditor from "@/components/storageConfigEditor/fields/textFieldEditor";
import NumberFieldEditor from "@/components/storageConfigEditor/fields/numberFieldEditor";
import BooleanFieldEditor from "@/components/storageConfigEditor/fields/booleanFieldEditor";
import SelectFieldEditor from "@/components/storageConfigEditor/fields/selectFieldEditor";
import PasswordFieldEditor from "@/components/storageConfigEditor/fields/passwordFieldEditor";

export type FieldValue = string | number | boolean | null;

type OnChangeCallback<T> = (value: T) => void;

type Props<T extends FieldValue> = {
    schema: SchemaField;
    value: T
    onChange: OnChangeCallback<T>
    error?: string,
    isLoading?: boolean
}

export default function FieldEditor<T extends FieldValue = string>({schema, ...props}: Props<T>) {
    switch (schema.type) {
        case SchemaFieldTypes.text:
            return <TextFieldEditor
                {...props}
                value={props.value as string | null}
                onChange={props.onChange as OnChangeCallback<string | null>}
                schema={schema}
            />
        case SchemaFieldTypes.number:
            return <NumberFieldEditor
                {...props}
                value={props.value as number | null}
                onChange={props.onChange as OnChangeCallback<number | null>}
                schema={schema}
            />
        case SchemaFieldTypes.boolean:
            return <BooleanFieldEditor
                {...props}
                value={props.value as boolean | null}
                onChange={props.onChange as OnChangeCallback<boolean | null>}
                schema={schema}
            />
        case SchemaFieldTypes.select:
            return <SelectFieldEditor
                {...props}
                value={props.value as string | null}
                onChange={props.onChange as OnChangeCallback<string | null>}
                schema={schema}
            />
        case SchemaFieldTypes.password:
            return <PasswordFieldEditor
                {...props}
                value={props.value as string | null}
                onChange={props.onChange as OnChangeCallback<string | null>}
                schema={schema}
            />
        default:
            return <>{JSON.stringify(schema, null, 2)}</>
    }
}