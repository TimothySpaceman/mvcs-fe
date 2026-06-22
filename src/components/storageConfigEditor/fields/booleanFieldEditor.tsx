import {BooleanSchemaField} from "@/lib/entities/storage";
import {Field, FieldContent, FieldDescription, FieldError, FieldLabel} from "@/components/ui/field";
import {Checkbox} from "@/components/ui/checkbox";

type Props = {
    schema: BooleanSchemaField;
    value: boolean | null
    onChange: (value: boolean | null) => void
    error?: string,
    isLoading?: boolean
}

export default function BooleanFieldEditor({schema, value, onChange, error, isLoading}: Props) {
    return <Field data-invalid={!!error} orientation="horizontal">
        <Checkbox
            id={`schema-input-${schema.key}`}
            name={schema.key}
            checked={!!value}
            onCheckedChange={(checked) => {
                if (checked !== "indeterminate") onChange(checked);
            }}
            defaultChecked={!!schema.defaultValue}
            aria-invalid={!!error}
            required={!!schema.required}
            disabled={isLoading}
        />
        <FieldContent>
            <FieldLabel htmlFor={`schema-input-${schema.key}`}>
                {schema.label}
            </FieldLabel>
            <FieldDescription>
                {schema.description}
            </FieldDescription>
            {error && <FieldError className="text-destructive">
                {error}
            </FieldError>}
        </FieldContent>
    </Field>
}