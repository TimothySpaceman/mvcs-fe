import {SchemaField} from "@/lib/entities/storage";
import {FieldGroup} from "@/components/ui/field";
import {useCallback, useState} from "react";
import FieldEditor, {FieldValue} from "@/components/storageConfigEditor/fields/fieldEditor";

type Props = {
    schemaFields: SchemaField[]
    initialValues?: Record<string, FieldValue>
    isLoading: boolean
}

export default function StorageConfigEditor({schemaFields, initialValues = {}, isLoading}: Props) {
    const [values, setValues] = useState<Record<string, FieldValue>>(initialValues);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    const setValue = useCallback((key: string, value: FieldValue) => {
        setValues(prev => ({...prev, [key]: value}));
    }, [setValues]);

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