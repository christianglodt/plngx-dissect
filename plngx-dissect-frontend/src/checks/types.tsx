export type CheckItemPropsType<CheckType> = {
    check: CheckType;
    onChange: (newCheck: CheckType) => void;
    onDelete: () => void;
}
