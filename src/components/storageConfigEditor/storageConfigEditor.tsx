import {SchemaField} from "@/lib/entities/storage";
import {FieldGroup} from "@/components/ui/field";
import {Dispatch, SetStateAction, useCallback} from "react";
import FieldEditor, {FieldValue} from "@/components/storageConfigEditor/fields/fieldEditor";

type Props = {
    schemaFields: SchemaField[]
    values: Record<string, FieldValue>
    onChange: Dispatch<SetStateAction<Record<string, FieldValue>>>;
    errors?: Record<string, string | undefined>
    isLoading?: boolean
}

export default function StorageConfigEditor({schemaFields, values, onChange, errors = {}, isLoading = false}: Props) {
    const setValue = useCallback((key: string, value: FieldValue) => {
        onChange(prev => ({...prev, [key]: value}));
    }, [onChange]);

    return <FieldGroup className="gap-3">
        {schemaFields.map(schema => <FieldEditor
            key={`config-field-${schema.key}`}
            schema={schema}
            value={values[schema.key]}
            onChange={(value) => setValue(schema.key, value)}
            isLoading={isLoading}
            error={errors[schema.key]}
        />)}
    </FieldGroup>
}