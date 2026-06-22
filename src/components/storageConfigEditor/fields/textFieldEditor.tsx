import {TextSchemaField} from "@/lib/entities/storage";
import {Input} from "@/components/ui/input";
import {Field, FieldDescription, FieldError, FieldLabel} from "@/components/ui/field";

type Props = {
    schema: TextSchemaField
    value: string | null
    onChange: (value: string | null) => void
    error?: string,
    isLoading?: boolean
}

export default function TextFieldEditor({schema, value, onChange, error, isLoading}: Props) {
    return <Field data-invalid={!!error}>
        <FieldLabel htmlFor={`schema-input-${schema.key}`}>
            {schema.label}
        </FieldLabel>
        <Input
            id={`schema-input-${schema.key}`}
            type="text"
            name={schema.key}
            value={value ?? ""}
            onChange={e => onChange(e.target.value.length > 0 ? e.target.value : null)}
            minLength={schema.minLength ?? undefined}
            maxLength={schema.maxLength ?? undefined}
            placeholder={schema.placeholder ?? undefined}
            pattern={schema.pattern ?? undefined}
            required={!!schema.required}
            disabled={isLoading}
            aria-invalid={!!error}
        />
        <FieldDescription>
            {schema.description}
        </FieldDescription>
        {error && <FieldError className="text-destructive">
            {error}
        </FieldError>}
    </Field>
}