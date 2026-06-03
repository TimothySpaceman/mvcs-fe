import {SelectSchemaField} from "@/lib/entities/storage";
import {Field, FieldDescription, FieldError, FieldLabel} from "@/components/ui/field";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

type Props = {
    schema: SelectSchemaField
    value: string | null
    onChange: (value: string | null) => void
    error?: string,
    isLoading?: boolean
}

export default function SelectFieldEditor({schema, value, onChange, error, isLoading}: Props) {
    return <Field data-invalid={!!error}>
        <FieldLabel htmlFor={`schema-input-${schema.key}`}>
            {schema.label}
        </FieldLabel>
        <Select value={value ?? undefined} onValueChange={onChange} disabled={isLoading} required={!!schema.required}>
            <SelectTrigger aria-invalid={!!error}>
                <SelectValue placeholder={schema.placeholder}/>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {schema.options.map(option => <SelectItem
                        key={`schema-input-${schema.key}-option-${option.value}`}
                        value={option.value}
                    >
                        {option.label}
                    </SelectItem>)}
                </SelectGroup>
            </SelectContent>
        </Select>
        <FieldDescription>
            {schema.description}
        </FieldDescription>
        {error && <FieldError className="text-destructive">
            {error}
        </FieldError>}
    </Field>
}