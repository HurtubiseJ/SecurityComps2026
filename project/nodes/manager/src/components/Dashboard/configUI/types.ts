

export type ConfigGroup = {
    groups: FieldGroup[]
}

export type FieldGroup = {
    fields: BaseField[]
    groupTitle: string
}

export interface BaseField {
    title: string,
    key: string,
    icon: React.ReactElement
}

export interface BooleanField extends BaseField {
    value: boolean
}

export interface RatioField extends BaseField {
    value: string
    pct: number
}

export interface TextField extends BaseField {
    value: string,
}