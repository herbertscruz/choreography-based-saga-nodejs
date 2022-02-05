export interface IDomain {
    toString(): string;
    getData(): object;
    validate(rules: object): void;
}