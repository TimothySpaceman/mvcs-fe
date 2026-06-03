import {NumberSchemaField} from "@/lib/entities/storage";
import {Input} from "@/components/ui/input";
import {Field, FieldDescription, FieldError, FieldLabel} from "@/components/ui/field";

type Props = {
    schema: NumberSchemaField;
    value: number | null
    onChange: (value: number | null) => void
    error?: string,
    isLoading?: boolean
}

export default function NumberFieldEditor({schema, value, onChange, error, isLoading}: Props) {
    return <Field data-invalid={!!error}>
        <FieldLabel htmlFor={`schema-input-${schema.key}`}>
            {schema.label}
        </FieldLabel>
        <Input
            id={`schema-input-${schema.key}`}
            type="number"
            name={schema.key}
            value={value ?? ""}
            onChange={e => onChange(e.target.value.length > 0 ? +e.target.value : null)}
            min={schema.min ?? undefined}
            max={schema.max ?? undefined}
            step={schema.step ?? undefined}
            placeholder={schema.placeholder ?? undefined}
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